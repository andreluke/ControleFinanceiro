import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { Input, Button, Modal } from '../../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { authService } from '../../src/services'
import { useAuthStore } from '../../src/stores/auth'
import { Icons, UserIcon, LockIcon, BellIcon, CalendarIcon, MailIcon } from '../../src/components/icons'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [name, setName] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notifications, setNotifications] = useState(true)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useFocusEffect(
    useCallback(() => {
      loadUser()
    }, [])
  )

  const loadUser = async () => {
    try {
      const userData = await authService.me()
      setUser(userData)
      setName(userData.name)
    } catch (err) {
      console.error('Error loading user:', err)
    }
  }

  const handleUpdateProfile = async () => {
    if (!name || !name.trim()) return

    setIsSubmitting(true)
    try {
      const updatedUser = await authService.updateProfile(name.trim())
      setUser(updatedUser)
      setShowEditModal(false)
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!')
    } catch (err) {
      console.error('Error updating profile:', err)
      Alert.alert('Erro', 'Não foi possível atualizar o perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Erro', 'Preen todos os campos')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem')
      return
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      setShowPasswordModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      Alert.alert('Sucesso', 'Senha alterada com sucesso!')
    } catch (err: any) {
      console.error('Error changing password:', err)
      Alert.alert('Erro', err.message || 'Não foi possível alterar a senha')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
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
          <Text style={styles.title}>Perfil</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Conta</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowEditModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <UserIcon size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Nome</Text>
                <Text style={styles.menuValue}>{user?.name}</Text>
              </View>
            </View>
            <Icons.ChevronRight size={20} color={colors.secondary} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <MailIcon size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>E-mail</Text>
                <Text style={styles.menuValue}>{user?.email}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <LockIcon size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>Alterar Senha</Text>
            </View>
            <Icons.ChevronRight size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <BellIcon size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>Notificações</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <CalendarIcon size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Membro desde</Text>
                <Text style={styles.menuValue}>{formatDate(user?.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Perfil">
        <View style={styles.modalContent}>
          <Input
            label="Nome"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
          />
          
          <Button
            onPress={handleUpdateProfile}
            isLoading={isSubmitting}
            disabled={!name || !name.trim()}
            style={styles.submitButton}
          >
            Salvar
          </Button>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} onClose={closePasswordModal} title="Alterar Senha">
        <View style={styles.modalContent}>
          <Input
            label="Senha Atual"
            placeholder="Sua senha atual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          
          <Input
            label="Nova Senha"
            placeholder="Nova senha (mín. 6 caracteres)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          
          <Input
            label="Confirmar Nova Senha"
            placeholder="Confirme a nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <Button
            onPress={handleChangePassword}
            isLoading={isSubmitting}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            style={styles.submitButton}
          >
            Alterar Senha
          </Button>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  menuValue: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginTop: 2,
  },
  modalContent: {
    gap: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
})
