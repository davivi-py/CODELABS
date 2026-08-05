// js/login.js
import { supabase } from './supabase.js'; // importa o objeto supabase do arquivo supabase.js

// mapeia elementos do html para variáveis js
const form = document.getElementById('form-login');
const btnLogin = document.getElementById('btn-login');
const msgStatus = document.getElementById('msg-status');

// pega pra onde deve voltar depois do login 
const parametros = new URLSearchParams(window.location.search);
const destino = parametros.get('next') || 'cadastro.html';

// Se já estiver logado, manda direto pro cadastro ou gerencua
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  window.location.href = destino;
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // não recarregar a tela ao enviar o formulário

  const email = document.getElementById('email').value.trim(); // trim: remove espaços em branco no início e no fim do email
  const senha = document.getElementById('senha').value;

  btnLogin.disabled = true;
  btnLogin.textContent = 'ENTRANDO...';
  msgStatus.textContent = '';
  msgStatus.className = 'msg-status'; // desabilita o botão para evitar cliques duplicadps

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  }); // chama a função oficial do Supabase signInWithPassword

  // exibe mensagem de erro caso o login falhe
  if (error) {
    console.error('Erro no login:', error);
    msgStatus.textContent = 'Email ou senha incorretos.';
    msgStatus.classList.add('erro');
    btnLogin.disabled = false;
    btnLogin.textContent = 'ENTRAR';
    return;
  }

  //redireciona pro destino original
  window.location.href = destino;
});