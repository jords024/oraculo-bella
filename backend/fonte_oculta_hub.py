#!/usr/bin/env python3
import os
import sys
from pathlib import Path


# Configuração de Cores para o Terminal (Estética Dark/Mística)
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    GOLD = '\033[38;5;214m'
    DARK_BLUE = '\033[38;5;18m'

def print_header():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"{Colors.GOLD}")
    print("=========================================================")
    print("                   A FONTE OCULTA                      ")
    print("               Hub Central de Operações                 ")
    print("=========================================================")
    print(f"{Colors.ENDC}")

def menu_principal():
    while True:
        print_header()
        print(f"{Colors.OKCYAN}[1]{Colors.ENDC} 🎠 Módulo de Carrosséis (Gerar, Revisar)")
        print(f"{Colors.OKCYAN}[2]{Colors.ENDC} 🎬 Módulo de Vídeo / Sora (Roteirista, B-Rolls)")
        print(f"{Colors.OKCYAN}[3]{Colors.ENDC} 🧠 Módulo de Inteligência (Oráculo, Radar Apify)")
        print(f"{Colors.OKCYAN}[4]{Colors.ENDC} 🌐 Módulo Social (Top Reels, Publicação Insta)")
        print(f"{Colors.OKCYAN}[5]{Colors.ENDC} 📊 Abrir Dashboard Interface")
        print(f"{Colors.OKCYAN}[0]{Colors.ENDC} Sair")
        print("\n" + "-"*57)

        escolha = input(f"Selecione o módulo de operação: {Colors.GOLD}")
        print(f"{Colors.ENDC}", end="")

        if escolha == '1':
            menu_carrosseis()
        elif escolha == '2':
            menu_video()
        elif escolha == '3':
            menu_inteligencia()
        elif escolha == '4':
            menu_social()
        elif escolha == '5':
            abrir_dashboard()
        elif escolha == '0':
            print("Encerrando conexão com A Fonte...")
            sys.exit(0)
        else:
            print(f"{Colors.FAIL}Opção inválida.{Colors.ENDC}")

def menu_carrosseis():
    print_header()
    print(f"{Colors.GOLD}--- MÓDULO DE CARROSSÉIS ---{Colors.ENDC}")
    print(f"{Colors.OKCYAN}[1]{Colors.ENDC} Listar Campanhas Criadas")
    print(f"{Colors.OKCYAN}[2]{Colors.ENDC} Criar Novo Carrossel (Oráculo -> Diretor)")
    print(f"{Colors.OKCYAN}[0]{Colors.ENDC} Voltar")
    escolha = input("\nEscolha: ")
    if escolha == '1':
        campanhas_dir = Path("campanhas/carrosseis")
        if campanhas_dir.exists():
            for f in campanhas_dir.glob("carrossel-*.py"):
                print(f" - {f.name}")
        else:
            print("Pasta não encontrada.")
        input("\nPressione Enter para voltar...")
    # Outras lógicas podem ser pludadas aqui

def menu_video():
    print_header()
    print(f"{Colors.GOLD}--- MÓDULO DE VÍDEO (SORA PIPELINE) ---{Colors.ENDC}")
    print(f"{Colors.WARNING}* Integração em construção (roteirista_reels, sora_manager) *{Colors.ENDC}")
    print(f"{Colors.OKCYAN}[1]{Colors.ENDC} Iniciar Agente Roteirista (Fatiamento de Cenas)")
    print(f"{Colors.OKCYAN}[2]{Colors.ENDC} Enviar para Sora (Gerar B-Rolls)")
    print(f"{Colors.OKCYAN}[0]{Colors.ENDC} Voltar")
    escolha = input("\nEscolha: ")
    if escolha in ['1', '2']:
        print(f"\n{Colors.WARNING}Em breve! Pipeline de vídeo sendo construído.{Colors.ENDC}")
        input("\nPressione Enter para voltar...")

def menu_inteligencia():
    print_header()
    print(f"{Colors.GOLD}--- MÓDULO DE INTELIGÊNCIA ---{Colors.ENDC}")
    print(f"{Colors.OKCYAN}[1]{Colors.ENDC} Rodar Oráculo Completo")
    print(f"{Colors.OKCYAN}[2]{Colors.ENDC} Rodar Radar Apify (Notícias Anômalas)")
    print(f"{Colors.OKCYAN}[0]{Colors.ENDC} Voltar")
    escolha = input("\nEscolha: ")
    if escolha == '1':
        os.system("python core/agentes/oraculo_completo.py")
        input("\nPressione Enter para voltar...")
    elif escolha == '2':
        os.system("python infra/social/radar_apify.py")
        input("\nPressione Enter para voltar...")

def menu_social():
    print_header()
    print(f"{Colors.GOLD}--- MÓDULO SOCIAL ---{Colors.ENDC}")
    print(f"{Colors.OKCYAN}[1]{Colors.ENDC} Consultar Top Reels (Engajamento)")
    print(f"{Colors.OKCYAN}[0]{Colors.ENDC} Voltar")
    escolha = input("\nEscolha: ")
    if escolha == '1':
        os.system("python infra/social/top_reels.py")
        input("\nPressione Enter para voltar...")

def abrir_dashboard():
    print(f"\n{Colors.OKGREEN}Iniciando Dashboard Web...{Colors.ENDC}")
    os.system("python open-dashboard.py")

if __name__ == "__main__":
    try:
        menu_principal()
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Operação abortada pelo usuário.{Colors.ENDC}")
        sys.exit(0)
