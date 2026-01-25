/**
 * ConfigManager - Singleton Thread-Safe (simulado en Node.js)
 *
 * THREAD SAFETY EN NODE.JS:
 * Node.js es single-threaded por naturaleza (event loop), así que
 * los problemas de concurrencia típicos de Java/C# no aplican igual.
 *
 * PERO:
 * - Worker Threads pueden crear race conditions
 * - Código asíncrono puede causar inicializaciones múltiples
 * - Es buena práctica entender el concepto para otros lenguajes
 *
 * ESTE EJEMPLO MUESTRA:
 * - Doble-check locking (patrón de thread-safety)
 * - Inicialización asíncrona segura
 * - Prevención de condiciones de carrera
 *
 * DOBLE-CHECK LOCKING:
 * 1. Check si existe (rápido, sin lock)
 * 2. Si no existe, adquirir lock
 * 3. Check de nuevo (por si otro thread creó la instancia mientras esperábamos el lock)
 * 4. Crear si sigue sin existir
 */

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  apiKey: string;
  features: {
    authentication: boolean;
    analytics: boolean;
    cache: boolean;
  };
}

export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private static initializationPromise: Promise<ConfigManager> | null = null;

  private config: AppConfig | null = null;
  private initialized: boolean = false;

  private constructor() {
    // Constructor privado
  }

  /**
   * getInstance - Versión síncrona
   *
   * Devuelve la instancia si ya existe, o lanza error si no está inicializada.
   * Usar cuando sabes que ya fue inicializada.
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      throw new Error('ConfigManager not initialized. Call initializeAsync() first.');
    }
    return ConfigManager.instance;
  }

  /**
   * initializeAsync - Versión asíncrona con doble-check locking
   *
   * PATRÓN DOBLE-CHECK LOCKING:
   * 1. Check rápido: ¿ya existe?
   * 2. Si no, check si hay inicialización en progreso
   * 3. Si no, crear nueva inicialización
   * 4. Esperar a que termine la inicialización
   *
   * ESTO PREVIENE:
   * - Múltiples inicializaciones simultáneas
   * - Race conditions en código asíncrono
   */
  public static async initializeAsync(configSource?: Partial<AppConfig>): Promise<ConfigManager> {
    // PRIMER CHECK: ¿Ya existe la instancia?
    if (ConfigManager.instance) {
      return ConfigManager.instance;
    }

    // SEGUNDO CHECK: ¿Hay inicialización en progreso?
    if (ConfigManager.initializationPromise) {
      return ConfigManager.initializationPromise;
    }

    // Crear la promesa de inicialización (esto actúa como "lock")
    ConfigManager.initializationPromise = (async () => {
      // TERCER CHECK: Por si acaso otra llamada creó la instancia mientras esperábamos
      if (ConfigManager.instance) {
        return ConfigManager.instance;
      }

      // Crear la instancia
      const instance = new ConfigManager();
      await instance.loadConfig(configSource);

      // Asignar la instancia (esto "libera el lock")
      ConfigManager.instance = instance;

      return instance;
    })();

    try {
      return await ConfigManager.initializationPromise;
    } finally {
      // Limpiar la promesa de inicialización
      ConfigManager.initializationPromise = null;
    }
  }

  /**
   * loadConfig - Carga la configuración (simulando carga asíncrona)
   */
  private async loadConfig(configSource?: Partial<AppConfig>): Promise<void> {
    // Simular carga de archivo de configuración o variables de entorno
    await new Promise(resolve => setTimeout(resolve, 100));

    this.config = {
      environment: configSource?.environment ?? 'development',
      apiUrl: configSource?.apiUrl ?? 'http://localhost:3000',
      apiKey: configSource?.apiKey ?? 'dev-key-123',
      features: {
        authentication: configSource?.features?.authentication ?? true,
        analytics: configSource?.features?.analytics ?? false,
        cache: configSource?.features?.cache ?? true,
      },
    };

    this.initialized = true;
  }

  /**
   * Métodos de acceso a la configuración
   */
  getConfig(): AppConfig {
    if (!this.initialized || !this.config) {
      throw new Error('Configuration not loaded');
    }
    return { ...this.config };
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    if (!this.initialized || !this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config[key];
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    if (!this.initialized || !this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.features[feature];
  }

  isDevelopment(): boolean {
    return this.get('environment') === 'development';
  }

  isProduction(): boolean {
    return this.get('environment') === 'production';
  }

  /**
   * resetForTesting - Solo para tests
   */
  static resetForTesting(): void {
    ConfigManager.instance = null;
    ConfigManager.initializationPromise = null;
  }
}
