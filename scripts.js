const script = document.createElement('script');
script.src = "https://unpkg.com/scrollreveal";
script.onload = () => {
  const baseOptions = {
    origin: 'top',
    distance: '50px',
    duration: 3000,      // animação mais lenta
    easing: 'ease',
    reset: true,        // só aparece uma vez
    viewFactor: 0.5,      // começa quando 20% do elemento estiver visível
  };

  ScrollReveal().reveal('.inicio > div', { ...baseOptions, interval: 600 });
  ScrollReveal().reveal('.sobre-conteudo > *', { ...baseOptions, interval: 600 });
  ScrollReveal().reveal('.servicos-grid > div', { ...baseOptions, interval: 500 });
  ScrollReveal().reveal('.depoimentos > div', { ...baseOptions, interval: 500 });
  ScrollReveal().reveal('.receitas-grid > div', { ...baseOptions, interval: 500 });
  ScrollReveal().reveal('.agendamento form > *', { ...baseOptions, interval: 500 });
};
document.body.appendChild(script);
