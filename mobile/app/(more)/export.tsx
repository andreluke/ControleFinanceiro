import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share, Platform, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Card, CardContent, Button, Modal } from '../../src/components/ui'
import { DatePickerInput } from '../../src/components/ui/DatePicker'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { exportService } from '../../src/services/export'
import { Icons, DownloadIcon, FileIcon, ExcelIcon, InfoIcon } from '../../src/components/icons'

type ExportFormat = 'csv' | 'pdf' | 'excel'

export default function ExportScreen() {
  const router = useRouter()
  const [showDateModal, setShowDateModal] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    setSelectedFormat(format)
    setShowDateModal(true)
  }

  const doExport = async () => {
    setIsExporting(true)
    try {
      const params = startDate || endDate ? {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      } : undefined

      let url: string
      let fileName: string

      switch (selectedFormat) {
        case 'excel':
          url = await exportService.exportExcel(params)
          fileName = 'relatorio_financeiro.xlsx'
          break
        case 'pdf':
          url = await exportService.exportPdf(params)
          fileName = 'relatorio_financeiro.pdf'
          break
        case 'csv':
        default:
          url = await exportService.exportCsv(params)
          fileName = 'transacoes.csv'
          break
      }

      if (Platform.OS === 'ios') {
        await Share.share({
          url,
          title: fileName,
        })
      } else {
        Alert.alert('Sucesso', `Arquivo ${fileName} gerado com sucesso!`)
      }

      setShowDateModal(false)
      setStartDate('')
      setEndDate('')
    } catch (err) {
      console.error('Export error:', err)
      Alert.alert('Erro', 'Não foi possível exportar os dados')
    } finally {
      setIsExporting(false)
    }
  }

  const closeModal = () => {
    setShowDateModal(false)
    setStartDate('')
    setEndDate('')
  }

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'Planilha simples, abre no Excel/Google Sheets'
      case 'pdf':
        return 'Documento com gráficos e resumo'
      case 'excel':
        return 'Planilha completa com múltiplas abas'
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icons.ChevronRight size={24} color={colors.foreground} />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Exportar Dados</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escolha o formato</Text>
          
          <TouchableOpacity style={styles.formatCard} onPress={() => handleExport('csv')}>
            <Card>
              <CardContent style={styles.formatContent}>
                <View style={styles.formatIcon}>
                  <DownloadIcon size={24} color={colors.primary} />
                </View>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatTitle}>CSV</Text>
                  <Text style={styles.formatDesc}>{getFormatDescription('csv')}</Text>
                </View>
                <Icons.ChevronRight size={20} color={colors.secondary} />
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={styles.formatCard} onPress={() => handleExport('pdf')}>
            <Card>
              <CardContent style={styles.formatContent}>
                <View style={styles.formatIcon}>
                  <FileIcon size={24} color={colors.primary} />
                </View>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatTitle}>PDF</Text>
                  <Text style={styles.formatDesc}>{getFormatDescription('pdf')}</Text>
                </View>
                <Icons.ChevronRight size={20} color={colors.secondary} />
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={styles.formatCard} onPress={() => handleExport('excel')}>
            <Card>
              <CardContent style={styles.formatContent}>
                <View style={styles.formatIcon}>
                  <ExcelIcon size={24} color={colors.primary} />
                </View>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatTitle}>Excel</Text>
                  <Text style={styles.formatDesc}>{getFormatDescription('excel')}</Text>
                </View>
                <Icons.ChevronRight size={20} color={colors.secondary} />
              </CardContent>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <InfoIcon size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Os dados exportados incluem todas as transações no período selecionado, resumo por categoria e totais.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showDateModal} onClose={closeModal} title={`Exportar ${selectedFormat.toUpperCase()}`}>
        <View style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            Selecione o período (opcional)
          </Text>

          <DatePickerInput
            label="Data Inicial"
            value={startDate}
            onChange={setStartDate}
            placeholder="Selecionar data inicial"
          />

          <DatePickerInput
            label="Data Final"
            value={endDate}
            onChange={setEndDate}
            placeholder="Selecionar data final"
          />

          <View style={styles.modalButtons}>
            <Button onPress={closeModal} variant="outline" style={styles.modalButton}>
              Cancelar
            </Button>
            <Button onPress={doExport} isLoading={isExporting} style={styles.modalButton}>
              Exportar
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  formatCard: {
    marginBottom: spacing.sm,
  },
  formatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
  },
  formatDesc: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginTop: 2,
  },
  infoSection: {
    padding: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  modalContent: {
    gap: spacing.md,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
})
