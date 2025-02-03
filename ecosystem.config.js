module.exports = {
    apps: [
        {
            name: 'email-service-nest', // Nama aplikasi
            script: 'dist/main.js', // Path ke file hasil build
            instances: 2, // Jumlah instance (0 untuk cluster mode dengan max CPU)
            exec_mode: 'cluster', // Cluster mode untuk memanfaatkan CPU
            env: {
                NODE_ENV: 'development', // Environment dev
            },
            env_production: {
                NODE_ENV: 'production', // Environment production
            },
        },
    ],
};
