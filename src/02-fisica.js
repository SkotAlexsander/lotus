/* ============================================================================
   02-fisica.js — o motor de movimento
   Molas interrompíveis, projeção de momento, rubber-banding e rastreio de
   velocidade. Nenhuma dependência externa.

   Por que mola e não transição CSS: uma transição de duração fixa não pode ser
   agarrada no meio do voo e revertida — ela precisa terminar primeiro. Uma mola
   parte sempre do valor que está na tela e aceita um alvo novo a qualquer
   quadro, carregando a velocidade junto. É isso que deixa a interface agarrável.
   ========================================================================= */
const Fisica = (() => {

  /* ------------------------------------------------------------ relógio */
  // Um único requestAnimationFrame para tudo. Mais barato que um por animação,
  // e garante que todas as molas avancem com o MESMO dt (nada desanda).
  const inscritos = new Set();
  let rodando = false;
  let tAnterior = 0;

  function quadro(t) {
    const dt = tAnterior ? Math.min((t - tAnterior) / 1000, 1 / 20) : 1 / 60;
    tAnterior = t;
    for (const fn of Array.from(inscritos)) fn(dt, t);
    if (inscritos.size) requestAnimationFrame(quadro);
    else { rodando = false; tAnterior = 0; }
  }

  function inscrever(fn) {
    inscritos.add(fn);
    if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    return () => inscritos.delete(fn);
  }

  /* -------------------------------------------------------------- mola */
  /*
     Parâmetros no vocabulário da Apple, não no da física:
       amortecimento (damping ratio) — 1.0 assenta sem passar do ponto;
                                       ~0.8 dá um leve repique.
       resposta (response, em segundos) — quão rápido chega ao alvo.
                                          NÃO é duração: a mola não tem duração.

     Valores que a Apple usa (Designing Fluid Interfaces, WWDC18):
       mover/reposicionar  1.0 / 0.4
       rotação             0.8 / 0.4
       gaveta (sheet)      0.8 / 0.3
  */
  class Mola {
    constructor(opcoes = {}) {
      this.amortecimento = opcoes.amortecimento ?? 1.0;
      this.resposta      = opcoes.resposta ?? 0.4;
      this.valor         = opcoes.valor ?? 0;
      this.alvo          = opcoes.alvo ?? this.valor;
      this.velocidade    = opcoes.velocidade ?? 0;
      this.epsilonV      = opcoes.epsilonV ?? 0.4;
      this.epsilonX      = opcoes.epsilonX ?? 0.15;
      this.aoAtualizar   = opcoes.aoAtualizar || null;
      this.aoParar       = opcoes.aoParar || null;
      this.parada        = true;
      this._solta        = null;
    }

    /* Redefine o alvo SEM zerar a velocidade — é isso que evita a "parede"
       quando o usuário inverte o gesto no meio do movimento. */
    para(alvo, opcoes = {}) {
      this.alvo = alvo;
      if (opcoes.velocidade !== undefined) this.velocidade = opcoes.velocidade;
      if (opcoes.amortecimento !== undefined) this.amortecimento = opcoes.amortecimento;
      if (opcoes.resposta !== undefined) this.resposta = opcoes.resposta;
      this._ligar();
      return this;
    }

    /* Coloca o valor na mão do usuário (arraste 1:1): a mola para de integrar
       e passa a apenas refletir o dedo. */
    fixa(valor, velocidade = 0) {
      this.valor = valor;
      this.velocidade = velocidade;
      this._desligar();
      if (this.aoAtualizar) this.aoAtualizar(this.valor, this.velocidade);
      return this;
    }

    congela() { this._desligar(); return this; }

    _ligar() {
      if (this._solta) return;
      this.parada = false;
      this._solta = inscrever((dt) => this._passo(dt));
    }
    _desligar() {
      if (this._solta) { this._solta(); this._solta = null; }
      this.parada = true;
    }

    _passo(dt) {
      const w = (2 * Math.PI) / this.resposta;   // frequência natural
      const z = this.amortecimento;

      // Integração em subpassos: com dt grande (aba trocada, celular travando)
      // o Euler semi-implícito explode. 1/240 s mantém estável em qualquer caso.
      const passos = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / passos;
      for (let i = 0; i < passos; i++) {
        const a = -w * w * (this.valor - this.alvo) - 2 * z * w * this.velocidade;
        this.velocidade += a * h;
        this.valor += this.velocidade * h;
      }

      const perto = Math.abs(this.valor - this.alvo) < this.epsilonX;
      const lento = Math.abs(this.velocidade) < this.epsilonV;
      if (perto && lento) {
        this.valor = this.alvo;
        this.velocidade = 0;
        this._desligar();
        if (this.aoAtualizar) this.aoAtualizar(this.valor, 0);
        if (this.aoParar) this.aoParar(this.valor);
        return;
      }
      if (this.aoAtualizar) this.aoAtualizar(this.valor, this.velocidade);
    }
  }

  /* ------------------------------------------------ projeção de momento */
  /*
     Para onde o dedo estava MANDANDO a coisa — não onde ele soltou.
     É a mesma decaída exponencial da rolagem do iOS. A fórmula de livro
     (v²/2a) não é a que a Apple usa; esta é a do código de exemplo do WWDC.
       taxa 0.998 = rolagem normal · 0.99 = mais curto, mais seco
  */
  function projetar(velocidade, taxa = 0.998) {
    return (velocidade / 1000) * taxa / (1 - taxa);
  }

  /* ------------------------------------------------------ rubber-banding */
  /*
     Passou do limite? Continua seguindo o dedo, mas cada vez menos.
     Parar duro lê como "travou"; resistir progressivamente lê como
     "responde, mas acabou".
  */
  function elastico(excesso, dimensao, c = 0.55) {
    return (excesso * dimensao * c) / (dimensao + c * Math.abs(excesso));
  }

  /* Aplica o elástico a um valor fora de [min, max]. */
  function limitarElastico(valor, min, max, dimensao) {
    if (valor < min) return min - elastico(min - valor, dimensao);
    if (valor > max) return max + elastico(valor - max, dimensao);
    return valor;
  }

  /* --------------------------------------------- rastreador de velocidade */
  /*
     A velocidade do último par de eventos é ruidosa (dt de 2ms vira 3000px/s).
     Média sobre uma janela curta de amostras dá o número que o dedo realmente
     tinha na hora de soltar.
  */
  class Rastreador {
    constructor(janelaMs = 90) { this.janela = janelaMs; this.amostras = []; }
    limpar() { this.amostras.length = 0; }
    anota(x, y, t = performance.now()) {
      this.amostras.push({ x, y, t });
      const corte = t - this.janela * 2;
      while (this.amostras.length > 2 && this.amostras[0].t < corte) this.amostras.shift();
    }
    velocidade() {
      const a = this.amostras;
      if (a.length < 2) return { x: 0, y: 0 };
      const fim = a[a.length - 1];
      let ini = a[0];
      for (let i = a.length - 1; i >= 0; i--) {
        if (fim.t - a[i].t > this.janela) break;
        ini = a[i];
      }
      const dt = (fim.t - ini.t) / 1000;
      if (dt <= 0.001) return { x: 0, y: 0 };
      return { x: (fim.x - ini.x) / dt, y: (fim.y - ini.y) / dt };
    }
  }

  /* ------------------------------------------------------------ apoios */
  const limitar = (v, min, max) => (v < min ? min : v > max ? max : v);
  const misturar = (a, b, t) => a + (b - a) * t;

  /* Escolhe o ponto de encaixe mais próximo do lugar PROJETADO — não do lugar
     onde o dedo soltou. É o que faz um peteleco parecer um arremesso. */
  function encaixeMaisProximo(pontos, projetado) {
    let melhor = pontos[0], dist = Infinity;
    for (const p of pontos) {
      const d = Math.abs(p - projetado);
      if (d < dist) { dist = d; melhor = p; }
    }
    return melhor;
  }

  /* O usuário pediu menos movimento? Então nada de mola nem deslize. */
  const menosMovimento = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    Mola, Rastreador,
    projetar, elastico, limitarElastico, encaixeMaisProximo,
    inscrever, limitar, misturar, menosMovimento,
  };
})();
