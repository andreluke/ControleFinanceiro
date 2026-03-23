package com.financeappandroid.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.financeappandroid.ui.theme.*

@Composable
fun TypeSelector(
    selectedType: TransactionType,
    onTypeSelected: (TransactionType) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        TypeButton(
            text = "Despesa",
            icon = Icons.Filled.ArrowDropDown,
            isSelected = selectedType == TransactionType.EXPENSE,
            selectedColor = Danger,
            onClick = { onTypeSelected(TransactionType.EXPENSE) },
            modifier = Modifier.weight(1f)
        )
        TypeButton(
            text = "Receita",
            icon = Icons.Filled.ArrowDropUp,
            isSelected = selectedType == TransactionType.INCOME,
            selectedColor = Success,
            onClick = { onTypeSelected(TransactionType.INCOME) },
            modifier = Modifier.weight(1f)
        )
    }
}

enum class TransactionType {
    INCOME,
    EXPENSE
}

@Composable
private fun TypeButton(
    text: String,
    icon: ImageVector,
    isSelected: Boolean,
    selectedColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val backgroundColor = if (isSelected) selectedColor.copy(alpha = 0.2f) else Card
    val borderColor = if (isSelected) selectedColor else Border
    val textColor = if (isSelected) selectedColor else Foreground

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(backgroundColor)
            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = text,
                color = textColor,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
            )
        }
    }
}
