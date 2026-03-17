import { api } from './api'

export interface ExportParams {
  startDate?: string
  endDate?: string
}

export const exportService = {
  async exportExcel(params?: ExportParams): Promise<string> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/seed/dashboard/export/excel${query}`, {
      headers: {
        'Authorization': `Bearer ${await api.getToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erro ao exportar Excel')
    }
    
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  },

  async exportPdf(params?: ExportParams): Promise<string> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/seed/dashboard/export/pdf${query}`, {
      headers: {
        'Authorization': `Bearer ${await api.getToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erro ao exportar PDF')
    }
    
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  },

  async exportCsv(params?: ExportParams): Promise<string> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/seed/dashboard/export/csv${query}`, {
      headers: {
        'Authorization': `Bearer ${await api.getToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erro ao exportar CSV')
    }
    
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  },
}
