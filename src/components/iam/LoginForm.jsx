import { useState, useRef } from 'react';
import iamApi from "../../lib/iam/iamApi";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Candado síncrono para evitar doble envío (Race Condition)
    const isSubmitting = useRef(false);

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
        
        // Bloqueo estricto: Si la referencia está activa, aborta la ejecución al instante
        if (isSubmitting.current) return;
        
        // Cerramos el candado inmediatamente
        isSubmitting.current = true;
        
        setError('');
        setLoading(true);

        try {
            const response = await iamApi.post('/auth/login', { email, password });
            const { access_token, user } = response.data;
            localStorage.setItem('jwt_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            
            window.location.href = '/iam/dashboard';
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Demasiados intentos fallidos. Por favor espera 1 minuto antes de volver a intentarlo.');
            } else {
                setError(err.response?.data?.error || 'Ocurrió un error al intentar conectar con el servidor.');
            }
            // Solo abrimos el candado si hay un error, ya que si hay éxito, la página se recargará
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
                    <span className="text-xs text-text/50 uppercase tracking-wider text-center">Credenciales de prueba</span>
                    <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => fillDemoCredentials('admin')} className="px-3 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full hover:bg-accent/20 transition-colors">
                            Admin
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('auditor')} className="px-3 py-1 text-xs font-medium text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full hover:bg-purple-400/20 transition-colors">
                            Auditor
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('operador')} className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full hover:bg-emerald-400/20 transition-colors">
                            Operador
                        </button>
                    </div>
                    <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg flex items-start gap-3">
                        <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-[11px] text-text/70 text-left leading-relaxed font-mono">
                            Selecciona un rol para auditar el <span className="text-white font-semibold">RBAC</span>:<br/>
                            • <span className="text-accent">Admin control total.</span><br/>
                            • <span className="text-purple-400">Auditor solo lectura.</span><br/>
                            • <span className="text-emerald-400">Operador acceso restringido.</span>
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1">Correo Electrónico</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1">Contraseña</label>
                    <input
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
                    {loading ? 'Autenticando...' : 'Iniciar Sesión'}
                </button>

                {/* Mensaje para el Cold Start en el Login */}
                {loading && (
                    <div className="text-center mt-3 animate-pulse">
                        <p className="text-xs text-text/70 leading-relaxed max-w-sm mx-auto">
                            ⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}