package com.financeappandroid.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.Help
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.financeappandroid.ui.screens.auth.AuthViewModel
import com.financeappandroid.ui.theme.*

@Composable
fun MoreScreen(
    onLogout: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showLogoutDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            "Mais",
            style = MaterialTheme.typography.headlineSmall,
            color = Foreground,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = Card),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(Primary.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = null,
                        tint = Primary,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        uiState.user?.name ?: "Usuario",
                        style = MaterialTheme.typography.titleMedium,
                        color = Foreground,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        uiState.user?.email ?: "",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Secondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            "Geral",
            style = MaterialTheme.typography.labelLarge,
            color = Secondary,
            modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = Card),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column {
                MenuItem(
                    icon = Icons.Filled.Person,
                    title = "Perfil",
                    subtitle = "Editar informacoes",
                    onClick = { }
                )
                HorizontalDivider(color = Border)
                MenuItem(
                    icon = Icons.Filled.Notifications,
                    title = "Notificacoes",
                    subtitle = "Configurar alertas",
                    onClick = { }
                )
                HorizontalDivider(color = Border)
                MenuItem(
                    icon = Icons.Filled.Security,
                    title = "Seguranca",
                    subtitle = "Senha e autenticacao",
                    onClick = { }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            "Dados",
            style = MaterialTheme.typography.labelLarge,
            color = Secondary,
            modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = Card),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column {
                MenuItem(
                    icon = Icons.Filled.Download,
                    title = "Exportar Dados",
                    subtitle = "Baixar relatorios",
                    onClick = { }
                )
                HorizontalDivider(color = Border)
                MenuItem(
                    icon = Icons.Filled.CloudUpload,
                    title = "Backup",
                    subtitle = "Fazer backup na nuvem",
                    onClick = { }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            "Suporte",
            style = MaterialTheme.typography.labelLarge,
            color = Secondary,
            modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = Card),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column {
                MenuItem(
                    icon = Icons.AutoMirrored.Filled.Help,
                    title = "Ajuda",
                    subtitle = "FAQ e tutoriais",
                    onClick = { }
                )
                HorizontalDivider(color = Border)
                MenuItem(
                    icon = Icons.Filled.Info,
                    title = "Sobre",
                    subtitle = "Versao 1.0.0",
                    onClick = { }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { showLogoutDialog = true },
            colors = ButtonDefaults.buttonColors(containerColor = Danger),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sair da conta")
        }

        Spacer(modifier = Modifier.height(100.dp))
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            containerColor = Card,
            title = { Text("Sair da conta", color = Foreground) },
            text = { Text("Tem certeza que deseja sair?", color = Secondary) },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout()
                        onLogout()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Danger)
                ) {
                    Text("Sair")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancelar", color = Secondary)
                }
            }
        )
    }
}

@Composable
private fun MenuItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Primary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                title,
                style = MaterialTheme.typography.bodyMedium,
                color = Foreground
            )
            Text(
                subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = Secondary
            )
        }
        Icon(
            imageVector = Icons.Filled.ChevronRight,
            contentDescription = null,
            tint = Secondary
        )
    }
}