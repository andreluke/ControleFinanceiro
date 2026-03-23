package com.financeappandroid.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.financeappandroid.ui.theme.*

@Composable
fun DebugLoginScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
    ) {
        Text(
            text = "LOGIN SCREEN WORKS!",
            color = Foreground,
            modifier = Modifier.align(Alignment.Center)
        )
    }
}