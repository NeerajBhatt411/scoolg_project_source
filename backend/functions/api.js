let cachedHandler;

exports.handler = async (event, context) => {
    if (!cachedHandler) {
        const [{ default: serverless }, appModule] = await Promise.all([
            import('serverless-http'),
            import('../server.js')
        ]);

        const app = appModule.default || appModule.app || appModule;
        cachedHandler = serverless(app);
    }

    return cachedHandler(event, context);
};
