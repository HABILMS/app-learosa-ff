import { motion } from 'motion/react';
import { ArrowRight, Mic, CheckCircle2, Sparkles, Brain, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    try {
      if (auth.currentUser) {
        navigate('/app');
        return;
      }
      await signInWithPopup(auth, googleProvider);
      navigate('/app');
    } catch (e) {
      console.error(e);
      // Fallback: still navigate if auth fails for some reason (users can use anonymously without saving)
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>IA turbinada com NVIDIA e Gemini</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif italic tracking-tight text-white mb-6 leading-[1.1]"
          >
            Nunca mais perca <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-sans not-italic font-bold">
               nenhum detalhe.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Grave, transcreva e resuma suas reuniões em tempo real. A inteligência artificial que transforma horas de conversas em atas organizadas em segundos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              <Mic className="w-5 h-5" />
              Começar a Gravar Grátis
            </button>
            <div className="text-sm text-white/40 font-mono">
              Não requer cartão de crédito
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24 px-6 bg-black relative border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-24">
          
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif italic text-white">Transcrição em Tempo Real</h2>
              <p className="text-lg text-white/50 font-light leading-relaxed">
                Nossa IA acompanha cada palavra dita na reunião, gerando legendas simultâneas com alta precisão e sem atrasos irritantes. Suporta multi-idiomas nativamente.
              </p>
              <ul className="space-y-3 pt-4">
                {['Reconhecimento avançado de fala', 'Suporte a mais de 50 idiomas', 'Captura de áudio do sistema e microfone'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="space-y-4">
                 <div className="w-24 h-4 bg-white/10 rounded-full animate-pulse" />
                 <div className="w-full h-8 bg-blue-500/20 rounded-lg" />
                 <div className="w-3/4 h-8 bg-white/5 rounded-lg" />
                 <div className="w-5/6 h-8 bg-white/5 rounded-lg" />
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif italic text-white">Resumos por IA</h2>
              <p className="text-lg text-white/50 font-light leading-relaxed">
                Com o poder da NVIDIA Meta Llama 3.1 70B e do Google Gemini, transformamos sua longa reunião em tópicos, decisões e itens de ação formatados da melhor forma possível.
              </p>
              <ul className="space-y-3 pt-4">
                {['Extração de Action Items', 'Análise de Sentimento (Em breve)', 'Exportação com um clique'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="space-y-6">
                 <div>
                    <div className="text-purple-400 text-sm font-bold mb-2 uppercase tracking-wide">Decisões:</div>
                    <div className="w-full h-6 bg-white/10 rounded-md mb-2" />
                    <div className="w-2/3 h-6 bg-white/10 rounded-md" />
                 </div>
                 <div>
                    <div className="text-blue-400 text-sm font-bold mb-2 uppercase tracking-wide">Próximos Passos:</div>
                    <div className="w-4/5 h-6 bg-white/5 rounded-md mb-2" />
                 </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* Benefits / Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Projetado para Produtividade</h2>
            <p className="text-white/40 max-w-xl mx-auto">Tudo que você precisa para tornar suas reuniões ágeis e eficientes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { icon: <Clock />, title: "Economize Horas", desc: "Não perca mais tempo escrevendo atas manualmente." },
              { icon: <Shield />, title: "Seguro & Privado", desc: "Seus dados armazenados com segurança e privacidade total." },
              { icon: <Sparkles />, title: "IA de Ponta", desc: "Modelos state-of-the-art processando seu texto na hora." }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-t from-purple-900/20 to-transparent border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-serif italic text-white">Pronto para focar na conversa?</h2>
          <p className="text-xl text-white/50 font-light max-w-2xl mx-auto">
            Junte-se a profissionais focados e impulsione a tomada de decisão no seu negócio.
          </p>
          <div className="pt-8">
             <button
              onClick={handleGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3 text-xl shadow-[0_0_50px_rgba(168,85,247,0.4)] mx-auto"
            >
              Começar Agora
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-white/30 text-sm">
        <p>© 2026 Transcrição Pro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
