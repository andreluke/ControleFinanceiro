package com.financeappandroid.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.financeappandroid.ui.theme.Primary

@Composable
fun AppButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    variant: ButtonVariant = ButtonVariant.Primary
) {
    val backgroundColor = when (variant) {
        ButtonVariant.Primary -> Primary
        ButtonVariant.Secondary -> MaterialTheme.colorScheme.surface
        ButtonVariant.Danger -> MaterialTheme.colorScheme.error
        ButtonVariant.Ghost -> Color.Transparent
    }

    val contentColor = when (variant) {
        ButtonVariant.Primary -> Color.White
        ButtonVariant.Secondary -> MaterialTheme.colorScheme.onSurface
        ButtonVariant.Danger -> Color.White
        ButtonVariant.Ghost -> Primary
    }

    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp),
        enabled = enabled && !isLoading,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = backgroundColor,
            contentColor = contentColor,
            disabledContainerColor = backgroundColor.copy(alpha = 0.5f),
            disabledContentColor = contentColor.copy(alpha = 0.5f)
        )
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                color = contentColor,
                strokeWidth = 2.dp,
                modifier = Modifier.height(20.dp)
            )
        } else {
            Text(
                text = text,
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

enum class ButtonVariant {
    Primary,
    Secondary,
    Danger,
    Ghost
}