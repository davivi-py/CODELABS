// js/gerenciar.js
import { supabase } from './supabase.js';

//Protege a página: verifica se há sessão ativa, só quem estiver logado acessa 
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.href = 'login.html?next=gerenciar.html';
}

const NOME_BUCKET = 'fotos_animais'; 

const listaGerenciar = document.getElementById('lista-gerenciar');

//botão de sair
document.getElementById('btn-sair').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html?next=gerenciar.html';
});

//busca todos os animais cadastrado
async function carregarAnimais() {
  const { data, error } = await supabase.from('animais').select('*').order('id', { ascending: false });

  if (error) {
    console.error('Erro ao buscar animais:', error);
    listaGerenciar.innerHTML = '<p class="vazio">Erro ao carregar animais.</p>';
    return;
  }

  renderizarLista(data);
}

function renderizarLista(animais) {
  if (animais.length === 0) {
    listaGerenciar.innerHTML = '<p class="vazio">Nenhum animal cadastrado ainda.</p>';
    return;
  }

  listaGerenciar.innerHTML = animais.map(animal => `
    <div class="card-animal">
      <img src="${animal.foto_url}" alt="${animal.nome}">
      <h3>${animal.nome}</h3>
      <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
        <a class="btn-detalhes" href="editar.html?id=${animal.id}">Editar</a>
        <button class="btn-apagar" data-id="${animal.id}" data-foto="${animal.foto_url}">Apagar</button>
      </div>
    </div>
  `).join('');

  // Liga o evento de apagar em cada botão
  document.querySelectorAll('.btn-apagar').forEach((botao) => {
    botao.addEventListener('click', () => apagarAnimal(botao.dataset.id, botao.dataset.foto));
  });
}

//Apaga um animal 
async function apagarAnimal(id, fotoUrl) {
  const confirmar = window.confirm('Tem certeza que deseja apagar este animal? Essa ação não pode ser desfeita.');
  if (!confirmar) return;

  // Apaga primeiro o registro da tabela
  const { error: erroDelete } = await supabase.from('animais').delete().eq('id', id);

  if (erroDelete) {
    console.error('Erro ao apagar animal:', erroDelete);
    alert('Erro ao apagar animal: ' + erroDelete.message);
    return;
  }

  // Tenta apagar a foto correspondente no Storage 
  try {
    const nomeArquivo = fotoUrl.split('/').pop();
    await supabase.storage.from(NOME_BUCKET).remove([nomeArquivo]);
  } catch (erro) {
    console.warn('Não foi possível apagar a foto do Storage:', erro);
  }

  carregarAnimais(); // recarrega a lista
}

carregarAnimais();