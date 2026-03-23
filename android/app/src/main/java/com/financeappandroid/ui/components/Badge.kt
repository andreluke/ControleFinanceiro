package com.financeappandroid.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.financeappandroid.ui.theme.*

@Composable
fun Badge(
    text: String,
    modifier: Modifier = Modifier,
    backgroundColor: Color = Primary,
    textColor: Color = Color.White
) {
    Text(
        text = text,
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(backgroundColor)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        color = textColor,
        style = MaterialTheme.typography.labelMedium,
        fontWeight = FontWeight.Medium
    )
}

@Composable
fun SuccessBadge(
    text: String,
    modifier: Modifier = Modifier
) {
    Badge(
        text = text,
        modifier = modifier,
        backgroundColor = Success.copy(alpha = 0.2f),
        textColor = Success
    )
}

@Composable
fun DangerBadge(
    text: String,
    modifier: Modifier = Modifier
) {
    Badge(
        text = text,
        modifier = modifier,
        backgroundColor = Danger.copy(alpha = 0.2f),
        textColor = Danger
    )
}

@Composable
fun WarningBadge(
    text: String,
    modifier: Modifier = Modifier
) {
    Badge(
        text = text,
        modifier = modifier,
        backgroundColor = Warning.copy(alpha = 0.2f),
        textColor = Warning
    )
}
