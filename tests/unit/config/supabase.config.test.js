describe('config/supabase', () => {
  let originalUrl;
  let originalKey;

  beforeAll(() => {
    originalUrl = process.env.SUPABASE_URL;
    originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterAll(() => {
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it('debe terminar el proceso cuando SUPABASE_URL falta', () => {
    // Arrange
    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    // Act / Assert
    jest.isolateModules(() => {
      expect(() => require('../../../src/config/supabase')).toThrow('process.exit(1)');
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    // Cleanup
    process.env.SUPABASE_URL = originalUrl;
    exitMock.mockRestore();
  });

  it('debe terminar el proceso cuando SUPABASE_SERVICE_ROLE_KEY falta', () => {
    // Arrange
    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Act / Assert
    jest.isolateModules(() => {
      expect(() => require('../../../src/config/supabase')).toThrow('process.exit(1)');
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    // Cleanup
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    exitMock.mockRestore();
  });

  it('debe usar NODE_ENV para el modo del log cuando está definido', () => {
    // Arrange
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.NODE_ENV = 'production';

    // Act
    jest.isolateModules(() => {
      require('../../../src/config/supabase');

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Supabase client initialized (mode: production)',
      );
    });

    // Cleanup
    process.env.NODE_ENV = originalNodeEnv;
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    consoleLogSpy.mockRestore();
  });

  it('debe usar "development" como modo del log por defecto cuando NODE_ENV no está definido', () => {
    // Arrange
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    delete process.env.NODE_ENV;

    // Act
    jest.isolateModules(() => {
      require('../../../src/config/supabase');

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Supabase client initialized (mode: development)',
      );
    });

    // Cleanup
    process.env.NODE_ENV = originalNodeEnv;
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    consoleLogSpy.mockRestore();
  });
});
