package com.financeappandroid.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.financeappandroid.ui.theme.*

data class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String,
    val isFab: Boolean = false
)

val bottomNavItems = listOf(
    BottomNavItem(MainScreen.Home.route, Icons.Filled.Home, "Início"),
    BottomNavItem(MainScreen.Transactions.route, Icons.Filled.CreditCard, "Trans."),
    BottomNavItem(MainScreen.Recurring.route, Icons.Filled.Repeat, "Rec."),
    BottomNavItem(MainScreen.AddTransaction.route, Icons.Filled.Add, "Adicionar", isFab = true),
    BottomNavItem(MainScreen.Goals.route, Icons.Filled.Flag, "Metas"),
    BottomNavItem(MainScreen.Budgets.route, Icons.Filled.PieChart, "Orçam."),
    BottomNavItem(MainScreen.Categories.route, Icons.Filled.Folder, "Gerenc."),
    BottomNavItem(MainScreen.More.route, Icons.Filled.Menu, "Mais")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainNavigation(
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val showBottomBar = currentDestination?.route in bottomNavItems.filter { !it.isFab }.map { it.route }

    Scaffold(
        modifier = modifier,
        containerColor = Background,
        bottomBar = {
            if (showBottomBar) {
                Surface(
                    color = Card,
                    tonalElevation = 8.dp,
                    shadowElevation = 8.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(72.dp)
                            .padding(horizontal = 4.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        bottomNavItems.forEach { item ->
                            if (item.isFab) {
                                // FAB - centered in 4th position, elevated above nav bar
                                Box(
                                    modifier = Modifier
                                        .size(56.dp)
                                        .offset(y = (-16).dp)
                                        .shadow(8.dp, CircleShape)
                                        .background(Primary, CircleShape)
                                        .clickable(
                                            interactionSource = remember { MutableInteractionSource() },
                                            indication = null
                                        ) {
                                            navController.navigate(item.route)
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = item.icon,
                                        contentDescription = item.label,
                                        tint = Foreground,
                                        modifier = Modifier.size(28.dp)
                                    )
                                }
                            } else {
                                BottomNavItemWidget(
                                    item = item,
                                    selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                                    onClick = { navigateTo(navController, item.route) }
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            MainNavGraph(
                navController = navController,
                onLogout = onLogout
            )
        }
    }
}

@Composable
private fun BottomNavItemWidget(
    item: BottomNavItem,
    selected: Boolean,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(horizontal = 6.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = item.icon,
            contentDescription = item.label,
            tint = if (selected) Primary else Secondary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = item.label,
            style = MaterialTheme.typography.labelSmall,
            color = if (selected) Primary else Secondary
        )
    }
}

private fun navigateTo(navController: NavHostController, route: String) {
    navController.navigate(route) {
        popUpTo(navController.graph.findStartDestination().id) {
            saveState = true
        }
        launchSingleTop = true
        restoreState = true
    }
}