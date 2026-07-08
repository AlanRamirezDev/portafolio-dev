import { useState, useRef } from 'react';
import iamApi from "../../lib/iam/iamApi";

// Diccionario
const ui = {
    es: {
        err429: 'Demasiados intentos fallidos. Por favor espera 1 minuto antes de volver a intentarlo.',
        errGeneral: 'Ocurrió un error al intentar conectar con el servidor.',
        demoLabel: 'Credenciales de prueba',
        roleOperator: 'Operador',
        rbacSelect: 'Selecciona un rol para auditar el',
        rbacAdmin: 'Admin control total.',
        rbacAuditor: 'Auditor solo lectura.',
        rbacOperator: 'Operador acceso restringido.',
        emailLabel: 'Correo Electrónico',
        passwordLabel: 'Contraseña',
        btnLoading: 'Autenticando...',
        btnLogin: 'Iniciar Sesión',
        coldStartNote: '⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.'
    },
    en: {
        err429: 'Too many failed attempts. Please wait 1 minute before trying again.',
        errGeneral: 'An error occurred while trying to connect to the server.',
        demoLabel: 'Test credentials',
        roleOperator: 'Operator',
        rbacSelect: 'Select a role to audit the',
        rbacAdmin: 'Admin full control.',
        rbacAuditor: 'Auditor read-only.',
        rbacOperator: 'Operator restricted access.',
        emailLabel: 'Email Address',
        passwordLabel: 'Password',
        btnLoading: 'Authenticating...',
        btnLogin: 'Sign In',
        coldStartNote: '⏳ Note: The backend uses a free cloud tier. If it is the first load after a period of inactivity, the server may take up to 60 seconds to start. Thank you for your patience.'
    }
};

export default function LoginForm({ lang = 'es' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isSubmitting = useRef(false);

    const t = (key) => ui[lang][key] || ui['es'][key];

    // Función utilitaria para la demo del portafolio
    const fillDemoCredentials = (role) => {
        const credentials = {
            admin: { email: 'admin@iam.test', password: 'Ppassword123*' },
            operador: { email: 'operador@iam.test', password: 'Ppassword123*' },
            auditor: { email: 'auditor@iam.test', password: 'Ppassword123*' }
        };
        setEmail(credentials[role].email);
        setPassword(credentials[role].password);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting.current) return;
        
        isSubmitting.current = true;
        
        setError('');
        setLoading(true);

        try {
            const response = await iamApi.post('/auth/login', { email, password });
            const { access_token, user } = response.data;
            localStorage.setItem('jwt_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            
            window.location.href = lang === 'es' ? '/iam/dashboard' : '/en/iam/dashboard';
        } catch (err) {
            if (err.response?.status === 429) {
                setError(t('err429'));
            } else {
                setError(err.response?.data?.error || t('errGeneral'));
            }
            isSubmitting.current = false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-xl shadow-2xl border border-white/5">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white tracking-tight">IAM Dashboard</h2>
                <p className="mt-2 text-sm text-text leading-relaxed">
                    Identity & Access Management.<br />
                </p>
            </div>

            {error && (
                <div className="p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Accesos Rápidos para Demo */}
                <div className="flex flex-col space-y-2 mb-2">
                    <span className="text-xs text-text/50 uppercase tracking-wider text-center">{t('demoLabel')}</span>
                    <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => fillDemoCredentials('admin')} className="px-3 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full hover:bg-accent/20 transition-colors">
                            Admin
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('auditor')} className="px-3 py-1 text-xs font-medium text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full hover:bg-purple-400/20 transition-colors">
                            Auditor
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('operador')} className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full hover:bg-emerald-400/20 transition-colors">
                            {t('roleOperator')}
                        </button>
                    </div>
                    <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg flex items-start gap-3">
                        <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-[11px] text-text/70 text-left leading-relaxed font-mono">
                            {t('rbacSelect')} <span className="text-white font-semibold">RBAC</span>:<br/>
                            • <span className="text-accent">{t('rbacAdmin')}</span><br/>
                            • <span className="text-purple-400">{t('rbacAuditor')}</span><br/>
                            • <span className="text-emerald-400">{t('rbacOperator')}</span>
                        </p>
                    </div>
                </div>

                <div>
                    <label htmlFor="emailInput" className="block text-sm font-medium text-text mb-1">{t('emailLabel')}</label>
                    <input
                        id="emailInput"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-mono text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="passwordInput" className="block text-sm font-medium text-text mb-1">{t('passwordLabel')}</label>
                    <input
                        id="passwordInput"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-mono text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium mt-4 shadow-[0_0_15px_rgba(0,128,255,0.3)]"
                >
                    {loading ? t('btnLoading') : t('btnLogin')}
                </button>

                {/* Mensaje para el Cold Start en el Login */}
                {loading && (
                    <div className="text-center mt-3 animate-pulse">
                        <p className="text-xs text-text/70 leading-relaxed max-w-sm mx-auto">
                            {t('coldStartNote')}
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}