// ScrollReveal
const script = document.createElement('script');
script.src = "https://unpkg.com/scrollreveal";
script.onload = () => {
  const configBase = {
    distance: '50px',
    duration: 3000,
    easing: 'ease',
    reset: true,
    viewFactor: 0.5,
  };

  ScrollReveal().reveal('.inicio > div', {
    ...configBase,
    origin: 'left',
    interval: 500,
    distance: '70px',
    scale: 0.8,
    opaçity: 0,
  });

  ScrollReveal().reveal('.sobre-conteudo > *', {
    ...configBase,
    origin: 'rotate: { x: 0, y: 0, z: 45 },',
    interval: 500,
    opaçity: 0.1,
    
  });

  ScrollReveal().reveal('.servicos-grid > div', {
    ...configBase,
    origin: 'right',
    interval: 400,
  });

  ScrollReveal().reveal('.depoimentos > div', {
    ...configBase,
    origin: 'bottom',
    interval: 400,
  });

  ScrollReveal().reveal('.receitas-grid > div', {
    ...configBase,
    origin: 'top',
    distance: '70px',
    interval: 450,
  });

  ScrollReveal().reveal('.agendamento form > *', {
    ...configBase,
    origin: 'left',
    interval: 400,
  });
};
document.body.appendChild(script);

const form = document.querySelector('form');
const botaoEnviar = form.querySelector('button[type="submit"]');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = document.getElementById('inputName').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const telefone = document.getElementById('inputPhone').value.trim();

  if (!nome) {
    alert('Por favor, preencha seu nome.');
    return;
  }
  if (!email) {
    alert('Por favor, preencha seu e-mail.');
    return;
  }
  if (!telefone) {
    alert('Por favor, preencha seu telefone.');
    return;
  }

  botaoEnviar.textContent = 'Enviando...';
  botaoEnviar.disabled = true;

  const numeroWhats = '5581986438384';
  const mensagem = 
    `Olá! Gostaria de agendar uma consulta.%0A` +
    `Nome: ${encodeURIComponent(nome)}%0A` +
    `Email: ${encodeURIComponent(email)}%0A` +
    `Telefone: ${encodeURIComponent(telefone)}`;

  const url = `https://wa.me/${numeroWhats}?text=${mensagem}`;

  window.open(url, '_blank');

  setTimeout(() => {
    botaoEnviar.textContent = 'Enviado com sucesso!';
    form.reset();

    setTimeout(() => {
      botaoEnviar.textContent = 'Enviar';
      botaoEnviar.disabled = false;
    }, 4000); 
  }, 1000);
});