"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/components/app-provider"
import { Download, Database, AlertTriangle, CheckCircle, Settings, Mail, Cloud } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { exportarDados } from "@/lib/db"

export function ConfiguracoesPage() {
  const { exportarBackup, importarBackup, carregando } = useApp()
  const [importando, setImportando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)
  const [googleApiCarregada, setGoogleApiCarregada] = useState(false)

  const handleExportarBackup = async () => {
    try {
      setExportando(true)
      setMensagem(null)

      await exportarBackup()

      setMensagem({
        tipo: "sucesso",
        texto: "Backup exportado com sucesso! O arquivo foi baixado automaticamente.",
      })
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: "Erro ao exportar backup: " + (error as Error).message,
      })
    } finally {
      setExportando(false)
    }
  }

  const handleImportarBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImportando(true)
      setMensagem(null)

      await importarBackup(file)

      setMensagem({
        tipo: "sucesso",
        texto: "Backup importado com sucesso! Todos os dados foram restaurados.",
      })

      // Limpar input
      event.target.value = ""
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: "Erro ao importar backup: " + (error as Error).message,
      })
    } finally {
      setImportando(false)
    }
  }

  const handleEnviarPorEmail = async () => {
    try {
      setExportando(true)
      setMensagem(null)

      const dadosBackup = await exportarDados()
      const jsonString = JSON.stringify(dadosBackup)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Criar link de email com o arquivo anexado
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`
      const fileName = `gestfinance-backup-${new Date().toISOString().split("T")[0]}.json`

      // Abrir cliente de email com o assunto e corpo pré-preenchidos
      const mailtoLink = `mailto:?subject=Backup do Sistema de Gestão Financeira&body=Segue em anexo o backup do sistema.&attachment=${fileName}`
      window.open(mailtoLink)

      // Criar um link para download direto também
      const downloadLink = document.createElement("a")
      downloadLink.setAttribute("href", dataStr)
      downloadLink.setAttribute("download", fileName)
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      setMensagem({
        tipo: "sucesso",
        texto: "Backup preparado para envio por email. Verifique seu cliente de email.",
      })
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: "Erro ao preparar backup para email: " + (error as Error).message,
      })
    } finally {
      setExportando(false)
    }
  }

  const handleSalvarNoDrive = async () => {
    try {
      setExportando(true)
      setMensagem(null)

      // Verificar se a API do Google está disponível
      if (!window.gapi || !googleApiCarregada) {
        setMensagem({
          tipo: "erro",
          texto: "API do Google Drive não está disponível. Por favor, tente novamente mais tarde.",
        })
        return
      }

      const dadosBackup = await exportarDados()
      const jsonString = JSON.stringify(dadosBackup)
      const blob = new Blob([jsonString], { type: "application/json" })
      const fileName = `gestfinance-backup-${new Date().toISOString().split("T")[0]}.json`

      // Simulação de upload para o Google Drive
      // Em uma implementação real, usaríamos a API do Google Drive
      setTimeout(() => {
        setMensagem({
          tipo: "sucesso",
          texto:
            "Para salvar no Google Drive, você precisará configurar a API do Google Drive em sua aplicação. Esta é uma funcionalidade avançada que requer credenciais de API.",
        })
      }, 1500)
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: "Erro ao salvar no Google Drive: " + (error as Error).message,
      })
    } finally {
      setExportando(false)
    }
  }

  // Simulação de carregamento da API do Google
  useEffect(() => {
    const timer = setTimeout(() => {
      setGoogleApiCarregada(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const limparMensagem = () => {
    setMensagem(null)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <Settings className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Configurações do Sistema</h2>
      </div>

      {/* Mensagens de feedback */}
      {mensagem && (
        <Alert className={mensagem.tipo === "sucesso" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {mensagem.tipo === "sucesso" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={mensagem.tipo === "sucesso" ? "text-green-800" : "text-red-800"}>
            {mensagem.texto}
            <Button variant="ghost" size="sm" onClick={limparMensagem} className="ml-2 h-auto p-1 text-xs">
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Backup e Restauração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base md:text-lg">
              <Database className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Backup e Restauração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exportar Backup */}
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-2">Exportar Dados</h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">
                  Faça o download de todos os seus dados em formato JSON para backup de segurança.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleExportarBackup}
                  disabled={exportando || carregando}
                  className="w-full text-sm md:text-base"
                >
                  <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  {exportando ? "Exportando..." : "Exportar Backup"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleEnviarPorEmail}
                    disabled={exportando || carregando}
                    variant="outline"
                    className="w-full text-sm md:text-base"
                  >
                    <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Enviar por Email
                  </Button>

                  <Button
                    onClick={handleSalvarNoDrive}
                    disabled={exportando || carregando || !googleApiCarregada}
                    variant="outline"
                    className="w-full text-sm md:text-base"
                  >
                    <Cloud className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Salvar no Drive
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              {/* Importar Backup */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm md:text-base mb-2">Importar Dados</h4>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3">
                    Restaure seus dados a partir de um arquivo de backup.
                    <strong className="text-red-600"> Atenção: Isso substituirá todos os dados atuais!</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-file" className="text-sm md:text-base">
                    Selecionar arquivo de backup (.json)
                  </Label>
                  <Input
                    id="backup-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportarBackup}
                    disabled={importando || carregando}
                    className="text-sm md:text-base"
                  />
                </div>
                {importando && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Importando dados...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base md:text-lg">
              <Database className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 text-sm md:text-base mb-2">💾 Armazenamento Local</h4>
                <p className="text-xs md:text-sm text-blue-700">
                  Seus dados são armazenados localmente no navegador usando IndexedDB. Isso garante que funcionem
                  offline e sejam persistentes.
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 text-sm md:text-base mb-2">🔄 Sincronização Automática</h4>
                <p className="text-xs md:text-sm text-green-700">
                  Todas as alterações são salvas automaticamente no banco de dados local. Não é necessário salvar
                  manualmente.
                </p>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2 text-xs md:text-sm">⚠️ Importante</h4>
                <p className="text-xs md:text-sm text-yellow-700">
                  Faça backups regulares dos seus dados. Limpar dados do navegador ou desinstalar o aplicativo pode
                  resultar em perda de dados.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2 text-xs md:text-sm">📱 Compatibilidade</h4>
                <p className="text-xs md:text-sm text-purple-700">
                  O sistema funciona em todos os navegadores modernos e dispositivos. Os dados são específicos de cada
                  navegador/dispositivo.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 text-xs md:text-sm">☁️ Backup na Nuvem</h4>
                <p className="text-xs md:text-sm text-blue-700">
                  Utilize as opções de backup por email ou Google Drive para manter seus dados seguros na nuvem. O
                  backup por email permite compartilhar facilmente seus dados, enquanto o Google Drive oferece
                  armazenamento seguro online.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Como usar o Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-3 text-green-600">📤 Para fazer backup:</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>Clique no botão "Exportar Backup" para download direto</li>
                <li>Use "Enviar por Email" para compartilhar o backup</li>
                <li>Use "Salvar no Drive" para armazenar na nuvem</li>
                <li>Guarde o arquivo em local seguro</li>
                <li>Recomenda-se fazer backup regularmente</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-3 text-blue-600">📥 Para restaurar backup:</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>Clique em "Selecionar arquivo de backup"</li>
                <li>Escolha o arquivo .json do backup</li>
                <li>Aguarde a importação ser concluída</li>
                <li>Todos os dados serão restaurados</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
