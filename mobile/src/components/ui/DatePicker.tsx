import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme/tokens'
import { Icons, CalendarIcon } from '../icons'

interface DatePickerInputProps {
  label?: string
  value: string
  onChange: (date: string) => void
  placeholder?: string
}

export function DatePickerInput({ label, value, onChange, placeholder = 'Selecionar data' }: DatePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [tempDate, setTempDate] = useState(new Date())

  const currentDate = value ? new Date(value) : new Date()

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR')
  }

  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
      if (event.type === 'set' && selectedDate) {
        onChange(formatDateForApi(selectedDate))
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate)
      }
    }
  }

  const handleConfirm = () => {
    onChange(formatDateForApi(tempDate))
    setShowPicker(false)
  }

  const handleCancel = () => {
    setShowPicker(false)
    setTempDate(value ? new Date(value) : new Date())
  }

  const handlePress = () => {
    setTempDate(value ? new Date(value) : new Date())
    setShowPicker(true)
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={handlePress} style={styles.input}>
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value ? formatDisplayDate(new Date(value)) : placeholder}
        </Text>
        <CalendarIcon size={20} color={colors.secondary} />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.modalDone}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                locale="pt-BR"
                textColor={colors.foreground}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '500',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputText: {
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  placeholder: {
    color: colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    fontSize: fontSize.md,
    color: colors.danger,
  },
  modalDone: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
})
