# Guia de Migração: React Native → Android Nativo (Kotlin)

> **Contexto**: Migração do app `ControleFinanceiro` de React Native (Expo SDK 54) para Android 100% nativo em Kotlin.

---

## Visão Geral da Estratégia

A abordagem recomendada é a **migração incremental por módulo** (strangler fig pattern), não uma reescrita big-bang. Cada módulo do app é reescrito isoladamente e substituído enquanto o resto continua funcionando — mas como o objetivo é 100% Kotlin, ao final o projeto RN é descartado completamente.

### Stack de Destino

| Camada | React Native | Kotlin Nativo |
|---|---|---|
| Framework | Expo SDK 54 | Android SDK + Jetpack |
| UI | Componentes customizados | Jetpack Compose |
| Navegação | Expo Router | Navigation Compose |
| Estado | Zustand | ViewModel + StateFlow |
| Data Fetching | TanStack React Query | Retrofit + Coroutines |
| Formulários | React Hook Form + Zod | Compose + validation manual |
| HTTP | Fetch API | Retrofit 2 + OkHttp |
| Cache/Storage | SecureStore + memória | EncryptedSharedPreferences + Room |
| Gráficos | recharts (web) | Vico / MPAndroidChart |
| Gestures | react-native-gesture-handler | Compose gestures nativo |
| Animações | react-native-reanimated | Compose Animation API |
| Ícones | SVG customizados | Vector Drawables / Compose Canvas |

---

## Fase 1 — Setup do Projeto Kotlin

### 1.1 Criar o projeto Android

- Abrir Android Studio → New Project → **Empty Activity**
- Selecionar **Kotlin** como linguagem
- `minSdk`: 26 (Android 8.0) — cobre >95% dos dispositivos
- `targetSdk`: 34 (Android 14)
- Pacote: `com.seuapp.controlefinanceiro`

### 1.2 Configurar `build.gradle` (app-level)

```kotlin
// build.gradle.kts (app)
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp) // para Room e Hilt
    alias(libs.plugins.hilt)
}

dependencies {
    // Compose BOM
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.material3)
    implementation(libs.compose.ui.tooling.preview)

    // Navigation
    implementation(libs.navigation.compose)

    // ViewModel
    implementation(libs.lifecycle.viewmodel.compose)
    implementation(libs.lifecycle.runtime.compose)

    // Hilt (DI)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)

    // Retrofit + OkHttp
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp.logging)

    // Room (banco local)
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // DataStore / EncryptedSharedPreferences
    implementation(libs.datastore.preferences)
    implementation(libs.security.crypto)

    // Gráficos
    implementation(libs.vico.compose)
    implementation(libs.vico.compose.m3)

    // Coroutines
    implementation(libs.coroutines.android)

    // Splash Screen
    implementation(libs.splashscreen)
}
```

### 1.3 Estrutura de pastas do projeto Kotlin

```
app/src/main/
├── java/com/seuapp/controlefinanceiro/
│   ├── MainActivity.kt
│   ├── di/                      # Hilt modules
│   ├── data/
│   │   ├── local/               # Room DAOs, Entities, Database
│   │   ├── remote/              # Retrofit services, DTOs
│   │   ├── repository/          # Implementações de repositório
│   │   └── preferences/         # EncryptedSharedPreferences / DataStore
│   ├── domain/
│   │   ├── model/               # Modelos de domínio (equivalente a types/)
│   │   ├── repository/          # Interfaces de repositório
│   │   └── usecase/             # Use cases (lógica de negócio)
│   └── ui/
│       ├── navigation/          # NavGraph, Routes
│       ├── theme/               # Cores, tipografia, shapes
│       ├── components/          # Componentes reutilizáveis (equivalente a ui/)
│       └── screens/
│           ├── auth/            # Login, Register
│           ├── dashboard/
│           ├── transactions/
│           ├── recurring/
│           ├── goals/
│           ├── budgets/
│           ├── categories/
│           └── more/
└── res/
    ├── drawable/                # Vector Drawables (ícones SVG → XML)
    └── values/                  # strings, colors (override pelo Compose Theme)
```

---

## Fase 2 — Autenticação e Token JWT

### Equivalência: `stores/auth.ts` → `AuthRepository` + `AuthViewModel`

#### 2.1 Armazenamento seguro do token

O `SecureStore` do Expo equivale ao `EncryptedSharedPreferences` do Android:

```kotlin
// data/preferences/TokenPreferences.kt
class TokenPreferences(context: Context) {
    private val prefs = EncryptedSharedPreferences.create(
        context,
        "auth_prefs",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String, rememberMe: Boolean) {
        prefs.edit()
            .putString("jwt_token", token)
            .putBoolean("remember_me", rememberMe)
            .apply()
    }

    fun getToken(): String? = prefs.getString("jwt_token", null)
    fun clearToken() = prefs.edit().clear().apply()
}
```

#### 2.2 Auto-refresh e interceptor 401

O interceptor do `services/api.ts` vira um `OkHttp Interceptor`:

```kotlin
// data/remote/AuthInterceptor.kt
class AuthInterceptor(
    private val tokenPreferences: TokenPreferences,
    private val authService: AuthService
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { ensureValidToken() }
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()

        val response = chain.proceed(request)

        if (response.code == 401) {
            response.close()
            val newToken = runBlocking { authService.refreshToken() }
            if (newToken != null) {
                val retryRequest = chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $newToken")
                    .build()
                return chain.proceed(retryRequest)
            }
        }
        return response
    }

    private suspend fun ensureValidToken(): String? {
        val token = tokenPreferences.getToken() ?: return null
        // Checar expiração (equivalente ao isTokenExpiringSoon() de jwt.ts)
        val decoded = JwtUtils.decode(token)
        val expiresAt = decoded?.expiresAt ?: return token
        val fiveMinutesFromNow = System.currentTimeMillis() + 5 * 60 * 1000
        return if (expiresAt < fiveMinutesFromNow) {
            authService.refreshToken() ?: token
        } else token
    }
}
```

---

## Fase 3 — Navegação

### Equivalência: Expo Router (`app/` file-based) → Navigation Compose

```kotlin
// ui/navigation/AppNavGraph.kt
sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Dashboard : Screen("dashboard")
    object Transactions : Screen("transactions")
    object AddTransaction : Screen("add_transaction")
    object Recurring : Screen("recurring")
    object Goals : Screen("goals")
    object Budgets : Screen("budgets")
    object Categories : Screen("categories")
    object Profile : Screen("profile")
    object Export : Screen("export")
}

@Composable
fun AppNavGraph(navController: NavHostController, isLoggedIn: Boolean) {
    NavHost(
        navController = navController,
        startDestination = if (isLoggedIn) Screen.Dashboard.route else Screen.Login.route
    ) {
        // Auth
        composable(Screen.Login.route) { LoginScreen(navController) }
        composable(Screen.Register.route) { RegisterScreen(navController) }

        // Main (com Bottom Navigation)
        composable(Screen.Dashboard.route) { DashboardScreen(navController) }
        composable(Screen.Transactions.route) { TransactionsScreen(navController) }
        composable(Screen.Recurring.route) { RecurringScreen(navController) }
        composable(Screen.Goals.route) { GoalsScreen(navController) }
        composable(Screen.Budgets.route) { BudgetsScreen(navController) }
        composable(Screen.Categories.route) { CategoriesScreen(navController) }

        // FAB
        composable(Screen.AddTransaction.route) { AddTransactionScreen(navController) }

        // More
        composable(Screen.Profile.route) { ProfileScreen(navController) }
        composable(Screen.Export.route) { ExportScreen(navController) }
    }
}
```

### Bottom Navigation (equivalente às tabs do Expo Router)

```kotlin
// ui/components/BottomNavBar.kt
val bottomNavItems = listOf(
    BottomNavItem("Início", Screen.Dashboard, Icons.Rounded.Home),
    BottomNavItem("Trans.", Screen.Transactions, Icons.Rounded.SwapHoriz),
    BottomNavItem("Recorr.", Screen.Recurring, Icons.Rounded.Repeat),
    BottomNavItem("Metas", Screen.Goals, Icons.Rounded.Flag),
    BottomNavItem("Orçam.", Screen.Budgets, Icons.Rounded.AccountBalance),
)
// FAB central separado no Scaffold
```

---

## Fase 4 — Camada de Dados (Services → Repository Pattern)

### Equivalência: `services/*.ts` → Retrofit + Repository

#### 4.1 Retrofit Service (equivalente a `services/transactions.ts`)

```kotlin
// data/remote/TransactionService.kt
interface TransactionService {
    @GET("transactions")
    suspend fun getTransactions(
        @Query("type") type: String? = null,
        @Query("category") category: String? = null,
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null,
    ): List<TransactionDto>

    @POST("transactions")
    suspend fun createTransaction(@Body body: CreateTransactionDto): TransactionDto

    @PUT("transactions/{id}")
    suspend fun updateTransaction(@Path("id") id: String, @Body body: UpdateTransactionDto): TransactionDto

    @DELETE("transactions/{id}")
    suspend fun deleteTransaction(@Path("id") id: String)
}
```

#### 4.2 Repository com cache (equivalente ao `cacheService`)

```kotlin
// data/repository/TransactionRepositoryImpl.kt
class TransactionRepositoryImpl(
    private val service: TransactionService,
    private val dao: TransactionDao,          // Room (cache local)
) : TransactionRepository {

    override fun getTransactions(): Flow<List<Transaction>> = flow {
        // 1. Emite cache local imediatamente
        emitAll(dao.getAll().map { it.map(TransactionEntity::toDomain) })

        // 2. Busca API e atualiza cache
        try {
            val remote = service.getTransactions()
            dao.upsertAll(remote.map(TransactionDto::toEntity))
        } catch (e: Exception) {
            // offline: cache já foi emitido
        }
    }

    override suspend fun createTransaction(data: CreateTransactionDto): Transaction {
        val result = service.createTransaction(data)
        dao.upsert(result.toEntity())
        return result.toDomain()
    }
}
```

---

## Fase 5 — Estado e ViewModel

### Equivalência: Zustand stores → ViewModel + StateFlow

```kotlin
// ui/screens/transactions/TransactionsViewModel.kt
@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val repository: TransactionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransactionsUiState())
    val uiState: StateFlow<TransactionsUiState> = _uiState.asStateFlow()

    init {
        loadTransactions()
    }

    private fun loadTransactions() {
        viewModelScope.launch {
            repository.getTransactions().collect { transactions ->
                _uiState.update { it.copy(transactions = transactions, isLoading = false) }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isLoading = true) }
        loadTransactions()
    }

    fun deleteTransaction(id: String) {
        viewModelScope.launch {
            repository.deleteTransaction(id)
        }
    }
}

data class TransactionsUiState(
    val transactions: List<Transaction> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)
```

---

## Fase 6 — UI com Jetpack Compose

### Equivalência: Componentes customizados → Composables

#### Tema (equivalente a `src/theme/tokens.ts`)

```kotlin
// ui/theme/Color.kt
val Background = Color(0xFF09090B)   // mesmo que #09090B
val Primary = Color(0xFF3B82F6)
val Success = Color(0xFF22C55E)
val Danger = Color(0xFFEF4444)
val Warning = Color(0xFFF59E0B)

// ui/theme/Theme.kt
@Composable
fun ControleFinanceiroTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Background,
            primary = Primary,
            error = Danger,
        ),
        content = content
    )
}
```

#### Componente Card (equivalente a `components/ui/Card`)

```kotlin
@Composable
fun AppCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        content = content
    )
}
```

#### Pull-to-refresh (presente em todas as listas)

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PullToRefreshList(isRefreshing: Boolean, onRefresh: () -> Unit) {
    val state = rememberPullToRefreshState()
    PullToRefreshBox(state = state, isRefreshing = isRefreshing, onRefresh = onRefresh) {
        // conteúdo da lista
    }
}
```

### Equivalência de Formulários

O `React Hook Form + Zod` não existe no Compose. Use o padrão:

```kotlin
// ViewModel gerencia o estado do formulário
data class LoginFormState(
    val email: String = "",
    val password: String = "",
    val emailError: String? = null,
    val passwordError: String? = null,
)

fun validateForm(state: LoginFormState): LoginFormState {
    return state.copy(
        emailError = if (!android.util.Patterns.EMAIL_ADDRESS.matcher(state.email).matches())
            "Email inválido" else null,
        passwordError = if (state.password.length < 6)
            "Senha muito curta" else null,
    )
}
```

---

## Fase 7 — Gráficos

### Equivalência: recharts (web) → Vico

```kotlin
// Adicionar ao build.gradle
implementation("com.patrykandpatrick.vico:compose-m3:2.0.0")

// Uso no Compose
@Composable
fun SpendingChart(data: List<CategorySummary>) {
    val model = remember(data) {
        CartesianChartModelProducer.build {
            columnSeries { series(data.map { it.amount.toFloat() }) }
        }
    }
    CartesianChartHost(
        chart = rememberCartesianChart(
            rememberColumnCartesianLayer()
        ),
        modelProducer = model,
    )
}
```

---

## Fase 8 — Exportação de Dados

### Equivalência: `services/export.ts` (PDF, CSV, Excel)

| Formato | Biblioteca Kotlin |
|---|---|
| PDF | `iTextPDF` (itextpdf:itext7-core) ou `PdfDocument` (Android nativo) |
| CSV | Escrita manual com `FileWriter` |
| Excel | `Apache POI` (poi-ooxml) |

```kotlin
// Compartilhar arquivo gerado
val uri = FileProvider.getUriForFile(context, "${context.packageName}.provider", file)
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "application/pdf"
    putExtra(Intent.EXTRA_STREAM, uri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}
context.startActivity(Intent.createChooser(intent, "Exportar"))
```

---

## Fase 9 — Injeção de Dependências (Hilt)

Substitui o gerenciamento manual de instâncias do TypeScript:

```kotlin
// di/NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient =
        OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply { level = Level.BODY })
            .build()

    @Provides @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    @Provides @Singleton
    fun provideTransactionService(retrofit: Retrofit): TransactionService =
        retrofit.create(TransactionService::class.java)
}
```

---

## Equivalência de Tipos (TypeScript → Kotlin)

| TypeScript (`src/types/index.ts`) | Kotlin (data class) |
|---|---|
| `interface Transaction { ... }` | `data class Transaction(...)` |
| `string` | `String` |
| `number` | `Double` / `Int` |
| `boolean` | `Boolean` |
| `string \| null` | `String?` |
| `Array<T>` | `List<T>` |
| `Promise<T>` | `suspend fun(): T` |

---

## Configuração de Ambiente

O `EXPO_PUBLIC_API_URL` vira `BuildConfig`:

```kotlin
// local.properties
API_URL=http://10.0.2.2:3000   # 10.0.2.2 = localhost no emulador Android

// build.gradle.kts
android {
    buildTypes {
        debug {
            buildConfigField("String", "API_URL", "\"${properties["API_URL"]}\"")
        }
    }
}
```

---

## Checklist de Migração por Módulo

- [ ] **Setup**: Projeto criado, dependências configuradas, tema aplicado
- [ ] **Auth**: Login, Register, JWT storage, auto-refresh, interceptor 401
- [ ] **Navigation**: NavGraph, Bottom Nav, FAB, rotas de auth vs main
- [ ] **Dashboard**: KPIs, gráficos (donut, barras, linha), pull-to-refresh
- [ ] **Transactions**: Lista, busca, filtros, ordenação, CRUD
- [ ] **Add Transaction**: Formulário completo com validação
- [ ] **Recurring**: Lista, toggle ativo, CRUD, gerar manual
- [ ] **Goals**: Cards de progresso, modal depósito/saque, histórico
- [ ] **Budgets**: Lista por categoria, progress bar, KPIs, alertas
- [ ] **Categories**: Tabs (categorias/subcategorias/formas pagamento), color picker, CRUD
- [ ] **Profile**: Editar nome, alterar senha
- [ ] **Export**: PDF, CSV, Excel com FileProvider

---

## Comandos Úteis

```bash
# Checar tipos / build
./gradlew assembleDebug

# Rodar testes unitários
./gradlew test

# Rodar no emulador
./gradlew installDebug

# Converter SVGs para Vector Drawable
# Android Studio: File → New → Vector Asset → Local SVG file
```

---

## Dicas para o Agent

1. **Sempre criar a camada `domain` antes de `data` e `ui`** — evita dependências circulares.
2. **Mapear DTOs ↔ Domain ↔ Entity** — nunca usar o DTO diretamente na UI.
3. **Um ViewModel por tela** — equivale a um arquivo de `store/` + `service/` combinados.
4. **Usar `StateFlow` para estado de UI**, `SharedFlow` para eventos one-shot (ex: navegar após login).
5. **EncryptedSharedPreferences** tem limite de tamanho — para dados maiores, usar Room.
6. **`runBlocking` no interceptor OkHttp é necessário** — o interceptor não é uma coroutine por padrão.
7. **Testar no emulador**: `10.0.2.2` aponta para `localhost` da máquina host.
8. **Não usar `remember` para estados que precisam sobreviver a recomposição** — usar `ViewModel`.
