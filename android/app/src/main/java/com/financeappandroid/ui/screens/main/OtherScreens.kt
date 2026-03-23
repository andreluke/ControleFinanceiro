package com.financeappandroid.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.financeappandroid.ui.theme.*

@Composable
fun RecurringScreen() {
    Box(
        modifier = Modifier.fillMaxSize().background(Background),
        contentAlignment = Alignment.Center
    ) {
        Text("Transacoes Recorrentes", style = MaterialTheme.typography.headlineMedium, color = Foreground)
    }
}

@Composable
fun GoalsScreen() {
    Box(
        modifier = Modifier.fillMaxSize().background(Background),
        contentAlignment = Alignment.Center
    ) {
        Text("Metas", style = MaterialTheme.typography.headlineMedium, color = Foreground)
    }
}

@Composable
fun BudgetsScreen() {
    Box(
        modifier = Modifier.fillMaxSize().background(Background),
        contentAlignment = Alignment.Center
    ) {
        Text("Orcamentos", style = MaterialTheme.typography.headlineMedium, color = Foreground)
    }
}

@Composable
fun MoreScreen(onLogout: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize().background(Background),
        contentAlignment = Alignment.Center
    ) {
        Text("Mais opcoes", style = MaterialTheme.typography.headlineMedium, color = Foreground)
    }
}