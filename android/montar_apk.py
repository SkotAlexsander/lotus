#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
Mapa Holistico — monta o APK de teste.

    python android/montar_apk.py            compila e entrega na Area de Trabalho
    python android/montar_apk.py --limpar   apaga a obra antes de compilar

O QUE ESTE SCRIPT FAZ E O QUE NAO FAZ
-------------------------------------
FAZ:  confere que o protótipo montado esta em dia com src/, copia o
      index.html para dentro do pacote, chama o Gradle e leva o APK
      pronto para a pasta de teste na Area de Trabalho.

NAO FAZ:  nao gera, nao reescreve e nao toca em nenhum .java, .gradle ou
      AndroidManifest.xml. Esses sao codigo-fonte, escritos a mao.

      A regra vem de um prejuizo real registrado neste repo: um gerador que
      REGERAVA as fontes Java ficou atrasado em relacao ao app e, ao rodar,
      derrubava funcionalidade EM SILENCIO. Gerador que reescreve o que foi
      editado a mao e armadilha de tempo. Este aqui so copia e compila.

POR QUE `debug` E NAO `release`
-------------------------------
Este APK existe para a Fase 0: instalar, testar, jogar fora. O build `debug`
usa a chave que o proprio Gradle cria em ~/.android/debug.keystore — nao ha
segredo para guardar nem para perder.

Um APK de `release` precisaria de chave propria, e chave de assinatura e
coisa seria: quem a tem consegue assinar um app que o Android instala POR
CIMA do seu, como se fosse atualizacao legitima. Quando este protótipo virar
produto (Fase 1), a chave nasce entao — fora do repositorio, com backup.

Consequencia pratica: o Android vai avisar que o app vem de "fonte
desconhecida" na instalacao. E o esperado para APK que nao veio da Play Store.
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

# O console do Windows e cp1252 e engasga em acento na primeira linha impressa.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
PROJETO = AQUI / "projeto"
ASSETS = PROJETO / "app" / "src" / "main" / "assets"
MONTADO = RAIZ / "prototipo" / "index.html"

# O caminho do SDK vem do AMBIENTE. Cravar o caminho desta maquina faria o
# script so funcionar aqui — e mandaria um caminho pessoal para o repositorio.
SDK = Path(
    os.environ.get("ANDROID_HOME")
    or os.environ.get("ANDROID_SDK_ROOT")
    or (Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "Android" / "Sdk")
)

PASTA_TESTE = "Mapa Holistico - TESTAR NO CELULAR"


def erro(msg):
    print("\n  ERRO: " + msg + "\n")
    sys.exit(1)


def achar_jdk():
    """
    Um JDK entre 17 e 23.

    O limite de cima nao e capricho: o JBR do Android Studio nesta maquina e
    o JDK 25, e o Gradle 8.11.1 morre nele com "Unsupported class file major
    version 69". O de baixo e o minimo do AGP 8.9. Entre os dois, qualquer um
    serve — dai procurar em vez de fixar um caminho.
    """
    bases = [Path.home() / ".jdks",
             Path(r"C:\Program Files\Java"),
             Path(r"C:\Program Files\Eclipse Adoptium"),
             Path(r"C:\Program Files\Microsoft"),
             Path(r"C:\Program Files\Zulu")]
    for base in bases:
        if not base.exists():
            continue
        for jdk in sorted(base.iterdir()):
            if not (jdk / "bin" / "javac.exe").exists():
                continue
            marca = jdk / "release"
            if not marca.exists():
                continue
            try:
                texto = marca.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for linha in texto.splitlines():
                if not linha.startswith("JAVA_VERSION="):
                    continue
                versao = linha.split("=", 1)[1].strip().strip('"')
                try:
                    maior = int(versao.split(".")[0])
                except ValueError:
                    continue
                if 17 <= maior <= 23:
                    return jdk, versao
    return None, None


def achar_gradle():
    """O Gradle que o AGP 8.9.1 aceita: 8.11.1 ou mais novo da serie 8."""
    dists = Path.home() / ".gradle" / "wrapper" / "dists"
    if not dists.exists():
        return None
    candidatos = []
    for d in dists.iterdir():
        for bat in d.glob("*/*/bin/gradle.bat"):
            nome = bat.parents[1].name          # gradle-8.11.1
            try:
                partes = nome.split("-")[1].split(".")
                versao = (int(partes[0]), int(partes[1]) if len(partes) > 1 else 0)
            except (IndexError, ValueError):
                continue
            # Serie 9 muda coisas que o AGP 8.9.1 nao acompanha; fica na 8.
            if versao[0] == 8 and versao >= (8, 11):
                candidatos.append((versao, bat))
    if not candidatos:
        return None
    candidatos.sort()
    return candidatos[0][1]      # o MAIS ANTIGO que serve: menos surpresa


def conferir_montado():
    """
    APK feito em cima de um index.html velho e a pior entrega possivel: parece
    certo, instala, e testa a versao errada. Por isso o build para aqui se o
    montado estiver atrasado em relacao a src/.
    """
    node = shutil.which("node")
    if not node:
        print("  (node nao encontrado no PATH — nao deu para conferir se o montado esta em dia)")
        return
    r = subprocess.run([node, "montar.js", "--check"], cwd=str(RAIZ),
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        erro("o protótipo montado esta ATRASADO em relacao a src/.\n"
             "  Rode antes:  node montar.js")
    print("  protótipo em dia com src/")


def copiar_app():
    if not MONTADO.exists():
        erro("nao achei %s. Rode antes: node montar.js" % MONTADO)

    if ASSETS.exists():
        shutil.rmtree(ASSETS)
    ASSETS.mkdir(parents=True)
    shutil.copy2(MONTADO, ASSETS / "index.html")

    tamanho = (ASSETS / "index.html").stat().st_size / 1024
    print("  index.html copiado para assets/  (%.0f KB)" % tamanho)


def compilar(jdk, jdk_versao, gradle, limpar):
    ambiente = os.environ.copy()
    ambiente["JAVA_HOME"] = str(jdk)
    # As DUAS tem de concordar: o Gradle PARA quando discordam
    # ("Several environment variables contain different paths to the SDK").
    ambiente["ANDROID_HOME"] = str(SDK)
    ambiente["ANDROID_SDK_ROOT"] = str(SDK)

    tarefas = (["clean"] if limpar else []) + ["assembleDebug"]
    print("  JDK %s  ·  %s" % (jdk_versao, jdk))
    print("  Gradle  ·  %s" % gradle.parents[1].name)
    print("  compilando (%s)… a primeira vez baixa dependencias e demora" % " ".join(tarefas))

    r = subprocess.run([str(gradle), "--no-daemon", "-q"] + tarefas,
                       cwd=str(PROJETO), env=ambiente,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        saida = (r.stdout or "") + "\n" + (r.stderr or "")
        uteis = [l for l in saida.splitlines()
                 if any(m in l for m in ("error:", "ERROR", "FAILURE", "Caused by", "> ", "What went wrong"))]
        erro("o Gradle falhou:\n    " + "\n    ".join(uteis[:25] or saida.splitlines()[-25:]))


def area_de_trabalho():
    # Nesta maquina a Area de Trabalho vive dentro do OneDrive.
    alvo = Path(os.environ.get("OneDrive", "")) / "Desktop"
    if alvo.exists():
        return alvo
    alvo = Path.home() / "OneDrive" / "Desktop"
    if alvo.exists():
        return alvo
    return Path.home() / "Desktop"


def entregar():
    apk = PROJETO / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
    if not apk.exists():
        erro("o Gradle terminou, mas o APK nao apareceu em %s" % apk)

    pasta = area_de_trabalho() / PASTA_TESTE
    pasta.mkdir(parents=True, exist_ok=True)
    destino = pasta / "Mapa Holistico (Android).apk"
    shutil.copy2(apk, destino)

    print("\n  APK: %s  (%.1f MB)" % (destino, destino.stat().st_size / 1024 / 1024))
    return destino, pasta


def conferir(apk, jdk):
    """APK que nao instala nao e entrega. Conferir a assinatura e barato."""
    apksigner = None
    build_tools = SDK / "build-tools"
    if build_tools.exists():
        for versao in sorted(build_tools.iterdir(), reverse=True):
            alvo = versao / "apksigner.bat"
            if alvo.exists():
                apksigner = alvo
                break
    if not apksigner:
        print("  (apksigner nao encontrado — assinatura NAO conferida)")
        return

    ambiente = os.environ.copy()
    ambiente["JAVA_HOME"] = str(jdk)
    r = subprocess.run([str(apksigner), "verify", "--print-certs", str(apk)],
                       capture_output=True, text=True, env=ambiente,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        erro("o APK NAO esta assinado corretamente:\n" + (r.stderr or r.stdout))
    for linha in (r.stdout or "").splitlines():
        if "SHA-256" in linha and "certificate" in linha:
            print("  " + linha.strip())
    print("  assinatura conferida (chave de debug).")


if __name__ == "__main__":
    limpar = "--limpar" in sys.argv
    print("\n  Mapa Holistico — montando o APK de teste\n")

    if not SDK.exists():
        erro("SDK do Android nao encontrado em %s" % SDK)
    jdk, jdk_versao = achar_jdk()
    if jdk is None:
        erro("nenhum JDK entre 17 e 23 encontrado. Instale um JDK 21 (Adoptium).")
    gradle = achar_gradle()
    if gradle is None:
        erro("nenhum Gradle 8.11+ da serie 8 encontrado em ~/.gradle/wrapper/dists")

    conferir_montado()
    copiar_app()
    compilar(jdk, jdk_versao, gradle, limpar)
    apk, pasta = entregar()
    conferir(apk, jdk)

    print("\n  Pasta de teste: %s" % pasta)
    print("  Pronto.\n")
