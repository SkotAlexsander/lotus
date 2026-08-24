package io.github.skotalexsander.mapaholistico;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

/**
 * Mapa Holístico — o protótipo dentro de uma janela nativa.
 *
 * O app inteiro é UM arquivo HTML dentro do pacote. Não há servidor, não há
 * requisição para a internet: as fontes estão embutidas e o mapa é desenhado
 * por código.
 *
 * Os arquivos são servidos por WebViewAssetLoader em
 * https://appassets.androidplatform.net/assets/ — não é a internet, é um
 * atalho que o próprio WebView intercepta antes de sair para a rede.
 *
 * Usar https (e não file://) importa: sem ORIGEM SEGURA o Android trata o
 * armazenamento como descartável e bloqueia parte das APIs modernas. Com
 * file:// o app abriria e defeitos apareceriam só no aparelho de alguém.
 */
public class MainActivity extends android.app.Activity {

    private static final String INICIO =
            "https://appassets.androidplatform.net/assets/index.html";

    /** O mesmo violeta da tela de abertura. Divergir aqui pisca outra cor
     *  entre a abertura do app e o primeiro quadro da página. */
    private static final int ABERTURA = 0xFF4A2F7B;

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle estadoSalvo) {
        super.onCreate(estadoSalvo);

        prepararJanela();

        web = new WebView(this);
        web.setBackgroundColor(ABERTURA);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);

        WebSettings cfg = web.getSettings();
        cfg.setJavaScriptEnabled(true);
        cfg.setDomStorageEnabled(true);
        cfg.setSupportZoom(false);
        cfg.setBuiltInZoomControls(false);
        cfg.setDisplayZoomControls(false);
        // Ignora a fonte gigante do sistema: o protótipo tem layout de tela de
        // celular e escala de texto do sistema quebraria o que se quer avaliar.
        cfg.setTextZoom(100);
        // Sem isto o `navigator.geolocation` da página fica em SILÊNCIO no
        // WebView: não responde e não dá erro — o pior tipo de falha.
        cfg.setGeolocationEnabled(true);
        if (Build.VERSION.SDK_INT >= 26) web.setDefaultFocusHighlightEnabled(false);

        final WebViewAssetLoader carregador = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest pedido) {
                return carregador.shouldInterceptRequest(pedido.getUrl());
            }

            /** Nada que não seja o próprio app abre DENTRO da janela. Link de
             *  fora vai para o aplicativo certo do celular (WhatsApp, navegador). */
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest pedido) {
                Uri u = pedido.getUrl();
                if (u != null && "appassets.androidplatform.net".equals(u.getHost())) return false;
                abrirFora(u);
                return true;
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                aplicarAreaSegura();
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            /**
             * A página pediu localização.
             *
             * São DUAS permissões em série, e confundi-las é o erro clássico:
             *   1. a do ANDROID, do sistema para o aplicativo  (a caixa cinza)
             *   2. a do WEBVIEW, do aplicativo para a página   (esta chamada)
             *
             * Conceder a segunda sem ter a primeira devolve "posição
             * indisponível" sem explicação nenhuma.
             */
            @Override
            public void onGeolocationPermissionsShowPrompt(String origem, GeolocationPermissions.Callback resposta) {
                if (temPermissaoDeLocal()) {
                    resposta.invoke(origem, true, false);
                    return;
                }
                origemPendente = origem;
                respostaPendente = resposta;
                if (Build.VERSION.SDK_INT >= 23) {
                    requestPermissions(new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION }, PEDIDO_LOCAL);
                } else {
                    resposta.invoke(origem, true, false);
                }
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                // Erro de JavaScript no aparelho some sem isto. Ver com:
                //   adb logcat -s MapaHolistico
                Log.d("MapaHolistico", m.message() + "  (" + m.sourceId() + ":" + m.lineNumber() + ")");
                return true;
            }
        });

        /* A ponte existe por UM motivo: `window.open` num WebView não abre nada
         * por padrão, e o botão "Chamar no WhatsApp" é a ação principal do app.
         * A superfície é mínima e a página é a nossa, empacotada aqui dentro —
         * não há conteúdo de terceiro rodando neste WebView. */
        web.addJavascriptInterface(new Ponte(), "PonteAndroid");

        // Depois do setContentView, NUNCA antes: sem DecorView criada,
        // getInsetsController() devolve null por dentro e o app morre na
        // abertura. Foi exatamente esse o crash medido no aparelho.
        //
        // O app e claro em quase toda tela. Sem isto o relogio e os icones do
        // sistema saem BRANCOS sobre o fundo creme e viram um borrao — defeito
        // que nao existe no navegador e so aparece com o app em tela cheia.
        // O padrao e "fundo claro"; a pagina avisa quando esta na abertura
        // violeta. Se o aviso falhar, o pior caso sao 1,5 s de icone escuro
        // sobre violeta — e nao a barra ilegivel a sessao inteira.
        fundoClaro(true);

        // Em build de DEPURAÇÃO, o WebView aceita o inspetor do Chrome
        // (chrome://inspect e CDP). É o que permite à bancada falar com a
        // página DENTRO do APK — e é como a tela de bloqueio foi provada.
        // Em release este flag é falso e nada disto existe.
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        criarCanalDeAvisos();
        registrarVoltar();
        web.loadUrl(INICIO);
    }

    /** Desenha até as bordas, para a página receber o tamanho real do recorte. */
    private void prepararJanela() {
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= 28) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }

    }

    /** true = a area sob a barra de status esta clara, entao icone escuro. */
    private void fundoClaro(boolean claro) {
      try {
        if (Build.VERSION.SDK_INT >= 30) {
            android.view.WindowInsetsController c = getWindow().getInsetsController();
            if (c == null) return;
            int mascara = android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                    | android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
            c.setSystemBarsAppearance(claro ? mascara : 0, mascara);
        } else if (Build.VERSION.SDK_INT >= 26) {
            int base = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
            int claros = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            getWindow().getDecorView().setSystemUiVisibility(claro ? (base | claros) : base);
        }
      } catch (Exception e) {
        // Barra com a cor errada e feio; app que nao abre e pior.
        Log.d("MapaHolistico", "nao deu para ajustar a barra de status: " + e.getMessage());
      }
    }

    /**
     * Diz à página onde ficam a barra de status e a barra de gestos.
     *
     * Por que não deixar o CSS resolver: `env(safe-area-inset-*)` só responde
     * em parte dos WebViews, e quando não responde volta ZERO — o cabeçalho
     * fica embaixo do relógio do celular e ninguém percebe no emulador. Quem
     * sabe a medida certa é o Android; a página lê de `--st` / `--sb` e só cai
     * no `env()` quando ninguém lhe disse nada (o caso do navegador).
     */
    private void aplicarAreaSegura() {
        if (Build.VERSION.SDK_INT < 28) return;
        web.post(new Runnable() {
            @Override
            public void run() {
                WindowInsets insets = web.getRootWindowInsets();
                if (insets == null) return;

                int topo, base;
                if (Build.VERSION.SDK_INT >= 30) {
                    android.graphics.Insets barras = insets.getInsets(
                            WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                    topo = barras.top;
                    base = barras.bottom;
                } else {
                    topo = insets.getSystemWindowInsetTop();
                    base = insets.getSystemWindowInsetBottom();
                }

                float d = getResources().getDisplayMetrics().density;
                int topoCss = Math.round(topo / d);
                int baseCss = Math.round(base / d);

                String js = "document.documentElement.style.setProperty('--st','" + topoCss + "px');"
                        + "document.documentElement.style.setProperty('--sb','" + baseCss + "px');";
                web.evaluateJavascript(js, null);
            }
        });
    }

    private void abrirFora(Uri destino) {
        if (destino == null) return;
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, destino);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            Log.d("MapaHolistico", "nada no celular abre " + destino + ": " + e.getMessage());
        }
    }

    private static final int PEDIDO_LOCAL = 7301;
    private static final int PEDIDO_AVISOS = 7302;
    private static final String CANAL_CONQUISTAS = "conquistas";
    private String avisoPendenteTitulo;
    private String avisoPendenteCorpo;

    /**
     * O canal é o que decide ONDE o aviso aparece — e a tela de bloqueio é
     * decisão do canal, não da notificação.
     *
     * VISIBILITY_PUBLIC mostra o conteúdo no bloqueio. É deliberado e é seguro
     * AQUI: os avisos deste app são conquistas ("Primeiros passos"), nunca dado
     * sensível. Num aviso de "a terapeuta respondeu você", a decisão teria de
     * ser revista — conteúdo de saúde na tela de bloqueio é vazamento para
     * quem estiver olhando por cima do ombro.
     *
     * IMPORTANCE_DEFAULT toca som mas não invade a tela (heads-up é
     * IMPORTANCE_HIGH). Conquista não é urgência; aviso que invade ensina a
     * desligar o canal.
     */
    private void criarCanalDeAvisos() {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel canal = new NotificationChannel(
                CANAL_CONQUISTAS, "Conquistas",
                NotificationManager.IMPORTANCE_DEFAULT);
        canal.setDescription("Avisos de conquistas do Mapa Holístico");
        canal.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
        ((NotificationManager) getSystemService(NOTIFICATION_SERVICE))
                .createNotificationChannel(canal);
    }

    private boolean podeNotificar() {
        if (Build.VERSION.SDK_INT < 33) return true;   // antes do 13 não há pedido
        return checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void mostrarAviso(String titulo, String corpo) {
        // Tocar o aviso abre o app — aviso que não leva a lugar nenhum é beco.
        Intent abrir = new Intent(this, MainActivity.class);
        abrir.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent toque = PendingIntent.getActivity(
                this, 0, abrir, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        android.app.Notification.Builder b = (Build.VERSION.SDK_INT >= 26)
                ? new android.app.Notification.Builder(this, CANAL_CONQUISTAS)
                : new android.app.Notification.Builder(this);
        b.setSmallIcon(R.mipmap.ic_launcher)
         .setContentTitle(titulo)
         .setContentText(corpo)
         .setContentIntent(toque)
         .setAutoCancel(true)
         .setVisibility(android.app.Notification.VISIBILITY_PUBLIC);

        // Um id por título: duas conquistas diferentes convivem; a mesma
        // conquista repetida (não deveria acontecer) substitui em vez de empilhar.
        ((NotificationManager) getSystemService(NOTIFICATION_SERVICE))
                .notify(titulo.hashCode(), b.build());
    }
    private String origemPendente;
    private GeolocationPermissions.Callback respostaPendente;

    private boolean temPermissaoDeLocal() {
        if (Build.VERSION.SDK_INT < 23) return true;
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    /**
     * A pessoa respondeu à caixa do Android. Só agora dá para responder à
     * página — e a resposta tem de ser HONESTA: negou é negou, e a página
     * mostra o caminho sem GPS em vez de ficar esperando para sempre.
     */
    @Override
    public void onRequestPermissionsResult(int pedido, String[] permissoes, int[] resultados) {
        super.onRequestPermissionsResult(pedido, permissoes, resultados);

        if (pedido == PEDIDO_AVISOS) {
            boolean deu = resultados.length > 0
                    && resultados[0] == PackageManager.PERMISSION_GRANTED;
            if (deu && avisoPendenteTitulo != null) {
                mostrarAviso(avisoPendenteTitulo, avisoPendenteCorpo);
            }
            // Negou: o aviso morre em silêncio. A conquista continua na tela
            // do app — a permissão nega o CANAL, não o fato.
            avisoPendenteTitulo = null;
            avisoPendenteCorpo = null;
            return;
        }

        if (pedido != PEDIDO_LOCAL || respostaPendente == null) return;

        boolean concedeu = false;
        for (int r : resultados) if (r == PackageManager.PERMISSION_GRANTED) concedeu = true;

        respostaPendente.invoke(origemPendente, concedeu, false);
        respostaPendente = null;
        origemPendente = null;
    }

    /** A ponte que a página chama. Duas funções, e nenhuma devolve dados. */
    private class Ponte {
        @JavascriptInterface
        public void abrirFora(String url) {
            if (url == null) return;
            final Uri u = Uri.parse(url);
            runOnUiThread(new Runnable() {
                @Override public void run() { MainActivity.this.abrirFora(u); }
            });
        }

        /**
         * A página conquistou algo e a POLÍTICA dela liberou o aviso (silêncio
         * noturno e limite por sessão são decididos LÁ, onde vive o relógio
         * simulável). Aqui só resta a permissão do sistema: sem ela, pede — e
         * guarda o aviso para mostrar assim que a pessoa conceder.
         */
        @JavascriptInterface
        public void notificar(final String titulo, final String corpo) {
            if (titulo == null || corpo == null) return;
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (podeNotificar()) {
                        mostrarAviso(titulo, corpo);
                    } else if (Build.VERSION.SDK_INT >= 33) {
                        avisoPendenteTitulo = titulo;
                        avisoPendenteCorpo = corpo;
                        requestPermissions(new String[]{
                                Manifest.permission.POST_NOTIFICATIONS }, PEDIDO_AVISOS);
                    }
                }
            });
        }

        /** A página avisa quando o fundo sob a barra de status muda de claridade. */
        @JavascriptInterface
        public void fundoClaro(final boolean claro) {
            runOnUiThread(new Runnable() {
                @Override public void run() { MainActivity.this.fundoClaro(claro); }
            });
        }
    }

    /**
     * O botão VOLTAR do Android é o mesmo gesto de puxar da borda: pergunta à
     * página se ela tem para onde voltar. Só sai do app quando ela não tem —
     * fechar o app no meio de um fluxo é a maior irritação de WebView mal feito.
     *
     * ⚠️ `onBackPressed()` SOZINHO NAO BASTA. Com targetSdk 35+ em Android 15 ou
     * mais novo, o gesto preditivo de voltar passa a ser o padrao e o sistema
     * NAO chama mais `onBackPressed()` — ele encerra a Activity direto. Foi
     * medido: com so o override, tocar em voltar com a folha aberta FECHAVA O
     * APP. Por isso o dispatcher novo e registrado quando existe, e o override
     * antigo fica para os aparelhos anteriores.
     */
    private void registrarVoltar() {
        if (Build.VERSION.SDK_INT < 33) { Log.d("MapaHolistico", "voltar: SDK antigo, usando onBackPressed"); return; }
        getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                new android.window.OnBackInvokedCallback() {
                    @Override public void onBackInvoked() {
                        Log.d("MapaHolistico", "voltar: dispatcher novo chamou");
                        tratarVoltar();
                    }
                });
        Log.d("MapaHolistico", "voltar: dispatcher novo registrado");
    }

    private void tratarVoltar() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript(
                // `App` e declarado com `const` no topo do script. `const` NAO vira
                // propriedade de `window` (so `var` e funcao viram), entao
                // `window.App` e undefined e a pergunta voltava sempre "nao" —
                // e o botao voltar fechava o app no meio do fluxo. Referencia
                // direta resolve pelo escopo do script, que e onde ele vive.
                "(function(){ try { if (typeof App !== 'undefined' && App.voltarSePuder && App.voltarSePuder()) return 'sim'; } catch(e){ return 'ERRO ' + e.message; } return 'nao'; })()",
                new android.webkit.ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String r) {
                        Log.d("MapaHolistico", "voltar: a pagina respondeu " + r);
                        if (r == null || !r.contains("sim")) finish();
                    }
                });
    }

    @Override
    public void onBackPressed() {
        Log.d("MapaHolistico", "voltar: onBackPressed antigo chamou");
        tratarVoltar();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            ((ViewGroup) web.getParent()).removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
