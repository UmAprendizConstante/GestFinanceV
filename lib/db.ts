/**
 * Módulo para gerenciamento do IndexedDB
 * Armazena dados financeiros localmente de forma persistente
 */

// Interface para os registros no IndexedDB
export interface Registro {
  id?: number
  tipo: "transacao" | "produto" | "saida" | "cadastros"
  dados: any
  dataModificacao: string
}

// Interface para backup completo
export interface BackupData {
  transacoes: any[]
  produtos: any[]
  saidasProdutos: any[]
  cadastros: any
  dataBackup: string
  versao: string
}

const DB_NAME = "GestFinanceVDB"
const DB_VERSION = 1
const STORE_NAME = "registros"

/**
 * Abre conexão com o IndexedDB
 * Cria o banco e object store se não existirem
 */
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error("Erro ao abrir banco de dados"))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Criar object store se não existir
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        })

        // Criar índices para facilitar consultas
        store.createIndex("tipo", "tipo", { unique: false })
        store.createIndex("dataModificacao", "dataModificacao", { unique: false })
      }
    }
  })
}

/**
 * Salva ou atualiza um registro no IndexedDB
 */
export async function salvarRegistro(registro: Omit<Registro, "id">): Promise<number> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    const registroComData = {
      ...registro,
      dataModificacao: new Date().toISOString(),
    }

    const request = store.add(registroComData)

    request.onsuccess = () => {
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject(new Error("Erro ao salvar registro"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Atualiza um registro existente no IndexedDB
 */
export async function atualizarRegistro(registro: Registro): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    const registroAtualizado = {
      ...registro,
      dataModificacao: new Date().toISOString(),
    }

    const request = store.put(registroAtualizado)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Erro ao atualizar registro"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Busca todos os registros do IndexedDB
 */
export async function buscarRegistros(): Promise<Registro[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error("Erro ao buscar registros"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Busca registros por tipo
 */
export async function buscarRegistrosPorTipo(tipo: string): Promise<Registro[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index("tipo")
    const request = index.getAll(tipo)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error("Erro ao buscar registros por tipo"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Remove um registro específico do IndexedDB
 */
export async function removerRegistro(id: number): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Erro ao remover registro"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Limpa todos os registros do IndexedDB
 */
export async function limparRegistros(): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Erro ao limpar registros"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Exporta todos os dados para backup em formato JSON
 */
export async function exportarDados(): Promise<BackupData> {
  try {
    const registros = await buscarRegistros()

    // Organizar dados por tipo
    const transacoes: any[] = []
    const produtos: any[] = []
    const saidasProdutos: any[] = []
    let cadastros: any = {
      lojas: ["Casa", "Trabalho", "Supermercado", "Banco"],
      descricoes: ["Conta Corrente", "Poupança", "Cartão de Crédito", "Dinheiro"],
      categoriasProdutos: ["Fardo", "Caixa", "Unidade", "Kg", "Lt"],
      marcas: ["Nestlé", "Coca-Cola", "Unilever", "P&G", "Johnson & Johnson"],
    }

    registros.forEach((registro) => {
      switch (registro.tipo) {
        case "transacao":
          transacoes.push(registro.dados)
          break
        case "produto":
          produtos.push(registro.dados)
          break
        case "saida":
          saidasProdutos.push(registro.dados)
          break
        case "cadastros":
          cadastros = registro.dados
          break
      }
    })

    const backup: BackupData = {
      transacoes,
      produtos,
      saidasProdutos,
      cadastros,
      dataBackup: new Date().toISOString(),
      versao: "1.0",
    }

    return backup
  } catch (error) {
    throw new Error("Erro ao exportar dados: " + (error as Error).message)
  }
}

/**
 * Importa dados de backup e substitui dados atuais
 */
export async function importarDados(backupData: BackupData): Promise<void> {
  try {
    // Validar estrutura do backup
    if (!backupData.transacoes || !backupData.produtos || !backupData.saidasProdutos || !backupData.cadastros) {
      throw new Error("Arquivo de backup inválido: estrutura incorreta")
    }

    // Limpar dados existentes
    await limparRegistros()

    // Importar transações
    for (const transacao of backupData.transacoes) {
      await salvarRegistro({
        tipo: "transacao",
        dados: transacao,
      })
    }

    // Importar produtos
    for (const produto of backupData.produtos) {
      await salvarRegistro({
        tipo: "produto",
        dados: produto,
      })
    }

    // Importar saídas de produtos
    for (const saida of backupData.saidasProdutos) {
      await salvarRegistro({
        tipo: "saida",
        dados: saida,
      })
    }

    // Importar cadastros
    await salvarRegistro({
      tipo: "cadastros",
      dados: backupData.cadastros,
    })
  } catch (error) {
    throw new Error("Erro ao importar dados: " + (error as Error).message)
  }
}

/**
 * Gera arquivo JSON para download
 */
export function gerarArquivoBackup(dados: BackupData): void {
  const jsonString = JSON.stringify(dados, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `gestfinance-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Lê arquivo JSON de backup
 */
export function lerArquivoBackup(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string
        const dados = JSON.parse(jsonString) as BackupData
        resolve(dados)
      } catch (error) {
        reject(new Error("Arquivo JSON inválido"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"))
    }

    reader.readAsText(file)
  })
}
