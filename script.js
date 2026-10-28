/*
  MOTOR DO TEMPLATE — não precisa ser alterado para personalizar um cliente.
  O HTML é montado a partir de window.BARBER_CONFIG (config.js).
*/
(() => {
  'use strict';
  const c = window.BARBER_CONFIG;
  const app = document.getElementById('app');
  if (!c || !app) { console.error('Configuração ausente. Verifique config.js.'); return; }

  // Escapamos dados de texto antes de adicionar strings ao HTML.
  const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeUrl = (url = '') => {
    const s = String(url ?? '').trim();
    if (!s || /^(javascript|data|vbscript):/i.test(s)) return '';
    if (/^(https?:\/\/|\.\.?\/|assets\/)/i.test(s)) return esc(s);
    return '';
  };
  const txt = (val) => esc(val);
  const image = (src, alt, cls = '', loading = 'lazy') => `<img class="${esc(cls)}" src="${safeUrl(src)}" alt="${esc(alt)}" loading="${loading}" decoding="async">`;
  const money = (price) => typeof price === 'number' && Number.isFinite(price) ? new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(price) : 'Sob consulta';
  const digits = value => String(value || '').replace(/\D/g, '');
  const getWa = (unit) => {
    const number = digits(unit?.whatsapp || c.contato?.whatsapp);
    const message = String(c.contato?.mensagem || 'Olá! Gostaria de agendar.').replaceAll('{unidade}',unit?.nome || 'Barbearia 43');
    return number.length >= 12 ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : '';
  };
  const waUrl = getWa(c.unidades?.[0]);
  const instagram = safeUrl(c.contato?.instagram);
  const cta = (extra = '', label = 'Escolher unidade') => `<a class="btn btn-primary ${extra}" href="#escolher-unidade">${esc(label)} <span aria-hidden="true">↗</span></a>`;
  const enabled = key => c.secoes?.[key] !== false;
  const link = (href, label) => safeUrl(href) ? `<a href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';

  // Variáveis CSS controladas pelo tema.
  const themeMap = { fundo:'--bg', superficie:'--surface', superficieClara:'--surface-2', texto:'--text', textoSuave:'--muted', destaque:'--accent', linha:'--line', fonteTitulo:'--font-display', fonteCorpo:'--font-body' };
  for (const [key, cssVar] of Object.entries(themeMap)) {
    const value = c.tema?.[key];
    if (typeof value === 'string' && value && !/[;{}]/.test(value)) document.documentElement.style.setProperty(cssVar, value);
  }
  if (/^https:\/\/fonts\.googleapis\.com\//.test(c.fonteUrl || '')) {
    const font = document.createElement('link'); font.rel = 'stylesheet'; font.href = c.fonteUrl; document.head.appendChild(font);
  }
  document.title = `${c.negocio?.nome ?? 'Barbearia'} | ${c.negocio?.cidade ?? ''}`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${c.negocio?.nome ?? 'Barbearia'} — ${c.negocio?.descricao ?? ''}`);
  const icon = document.querySelector('link[rel="icon"]'); if (icon && safeUrl(c.negocio?.logo)) icon.href = c.negocio.logo;

  const firstUnit = c.unidades?.[0];
  const services = enabled('servicos') && firstUnit ? `
    <section class="section services" id="servicos" aria-labelledby="servicos-titulo"><div class="container">
      <div class="section-top"><div><div class="eyebrow">02 / Serviços e valores</div><h2 id="servicos-titulo">SEU CORTE.<span class="outline"> SUA ESCOLHA.</span></h2></div><p>Selecione uma unidade para consultar os serviços e preços correspondentes.</p></div>
      <div class="service-choice" role="group" aria-label="Unidade para consultar serviços">${c.unidades.map((u,i)=>`<button type="button" class="service-choice-button ${i===0?'is-active':''}" data-unit="${esc(u.id)}" aria-pressed="${i===0?'true':'false'}">${esc(u.nome)} <span>↗</span></button>`).join('')}</div>
      <div id="service-content" aria-live="polite"></div>
      <p class="service-notice">Os valores podem mudar. Confirme disponibilidade e preços antes de agendar.</p>
    </div></section>` : '';
  const serviceHTML = unit => (unit.categorias || []).map(cat => `<div class="service-category"><h3 class="category-heading">${txt(cat.categoria)}</h3><div class="service-list">${(cat.itens || []).map((s,i)=>`<article class="service"><span class="service-index">${String(i+1).padStart(2,'0')}</span><div><h3>${txt(s.nome)}</h3>${s.duracao ? `<p>${txt(s.duracao)}</p>` : ''}</div><div class="service-end">${s.observacao ? `<small>${txt(s.observacao)}</small>` : ''}<strong>${money(s.preco)}</strong></div></article>`).join('')}</div></div>`).join('') + `<div class="section-bottom">${getWa(unit) ? `<a class="btn btn-primary" href="${safeUrl(getWa(unit))}" target="_blank" rel="noopener noreferrer">Agendar no ${txt(unit.nome)} ↗</a>` : `<a class="btn btn-outline" href="${safeUrl(unit.instagram || c.contato?.instagram)}" target="_blank" rel="noopener noreferrer">Consultar agendamento ↗</a>`}</div>`;
  const gallery = enabled('galeria') && (c.galeria || []).length ? `
    <section class="section gallery-section" id="galeria" aria-labelledby="galeria-titulo"><div class="container">
      <div class="section-top"><div><div class="eyebrow">02 / Nossa essência</div><h2 id="galeria-titulo">DENTRO DA <span class="outline">43.</span></h2></div><p>Momentos, detalhes e o movimento de quem vive a barbearia.</p></div>
      <div class="gallery-grid">${c.galeria.map((g,i) => `<figure class="gallery-item gallery-item-${i % 4}">${g.src ? image(g.src, g.alt || 'Imagem da barbearia') : `<div class="gallery-placeholder" role="img" aria-label="${esc(g.alt || 'Foto em breve')}"><span>43</span><small>FOTO EM BREVE</small></div>`}<figcaption><span>${txt(g.tipo || 'Galeria')}</span><span aria-hidden="true">↗</span></figcaption></figure>`).join('')}</div>
    </div></section>` : '';

  const about = enabled('sobre') ? `<section class="about section" id="sobre" aria-labelledby="sobre-titulo"><div class="container about-layout">
    <div class="about-logo-panel">${image(c.negocio.logo,'Logo oficial da Barbearia 43','about-logo')}</div>
    <div class="about-copy"><div class="eyebrow">04 / Nossa história</div><h2 id="sobre-titulo">${txt(c.negocio.sobreTitulo)}</h2><p>${txt(c.negocio.sobreTexto)}</p><div class="about-signature">${txt(c.negocio.selo || '')}<span class="star" aria-hidden="true">✳</span></div></div>
    </div></section>` : '';
  const team = enabled('equipe') && (c.equipe || []).length ? `<section class="section team" id="equipe" aria-labelledby="equipe-titulo"><div class="container"><div class="section-top"><div><div class="eyebrow">04 / Quem faz acontecer</div><h2 id="equipe-titulo">NOSSO <span class="outline">TIME.</span></h2></div></div><div class="team-grid">${c.equipe.map(m => `<article class="person">${image(m.imagem || 'assets/imagens/cadeira.svg', `Foto de ${m.nome}`)}<div class="person-info"><div><h3>${txt(m.nome)}</h3><p>${txt(m.cargo || 'Barbeiro')}</p></div>${m.instagram ? link(m.instagram,'Instagram') : ''}</div></article>`).join('')}</div></div></section>` : '';

  const reviews = enabled('depoimentos') && (c.depoimentos || []).length ? `<section class="section reviews" id="depoimentos" aria-labelledby="depoimentos-titulo"><div class="container"><div class="eyebrow">05 / Quem conhece, recomenda</div><h2 id="depoimentos-titulo">O QUE DIZEM <span class="outline">DE NÓS.</span></h2><div class="review-grid">${c.depoimentos.map(r => `<blockquote class="review"><div aria-label="5 estrelas">★★★★★</div><p>“${txt(r.texto)}”</p><footer>${txt(r.nome)} ${r.fonte ? `· ${txt(r.fonte)}` : ''}</footer></blockquote>`).join('')}</div></div></section>` : '';

  const units = enabled('unidades') && c.unidades?.length ? `<section class="section units" id="unidades" aria-labelledby="unidades-titulo"><div class="container"><div class="section-top"><div><div class="eyebrow">05 / Visite a 43</div><h2 id="unidades-titulo">DUAS UNIDADES.<br><span class="outline">DOIS JEITOS DE VIVER A 43.</span></h2></div></div><div class="units-grid">${c.unidades.map((u,i)=>`<article class="unit" id="unidade-${esc(u.id)}"><div class="unit-count">UNIDADE 0${i+1}</div><h3>${txt(u.nome)}</h3><p class="unit-subtitle">${txt(u.subtitulo || '')}</p><p>${txt(u.descricao || '')}</p><p class="unit-address">${txt(u.endereco)}</p><div class="hours"><h4>HORÁRIOS</h4>${(u.horario || []).map(h=>`<div><span>${txt(h.dia)}</span><span>${txt(h.horas)}</span></div>`).join('')}<small>${txt(u.avisoHorario || '')}</small></div><div class="unit-buttons">${link(u.mapsUrl,'Como chegar')}${getWa(u) ? `<a href="${safeUrl(getWa(u))}" target="_blank" rel="noopener noreferrer">Agendar pelo WhatsApp ↗</a>` : `<a href="${safeUrl(u.instagram || c.contato?.instagram)}" target="_blank" rel="noopener noreferrer">Consultar agendamento ↗</a>`}</div></article>`).join('')}</div></div></section>` : '';
  const choose = `<section class="unit-intro section" id="escolher-unidade" aria-labelledby="escolher-titulo"><div class="container"><div class="eyebrow">01 / A experiência é sua</div><h2 id="escolher-titulo">QUAL É A <span class="outline">SUA 43?</span></h2><p class="choose-description">A mesma marca, duas experiências. Escolha a unidade ideal para seu estilo.</p><div class="choose-grid">${c.unidades.map((u,i)=>`<article class="choose-card ${i===1?'choose-premium':''}"><span class="choose-index">0${i+1} / ${txt(c.negocio.cidade)}</span><h3>${txt(u.nome)}</h3><p>${txt(u.subtitulo || '')}</p><p class="choose-summary">${txt(u.descricao || '')}</p><button class="choose-button" type="button" data-unit="${esc(u.id)}">Ver serviços e preços <span aria-hidden="true">↗</span></button></article>`).join('')}</div></div></section>`;
  const navItems = [enabled('servicos') && c.unidades?.length && ['servicos','Serviços'], enabled('galeria') && c.galeria?.length && ['galeria','Galeria'], enabled('sobre') && ['sobre','Nossa história'], enabled('equipe') && c.equipe?.length && ['equipe','Equipe'], enabled('unidades') && c.unidades?.length && ['unidades','Unidades']].filter(Boolean);
  const socials = [['Instagram',c.contato?.instagram],['Facebook',c.contato?.facebook],['TikTok',c.contato?.tiktok]].filter(x => safeUrl(x[1]));

  app.innerHTML = `
    <header class="header" id="topo"><div class="container header-inner">
      <a href="#topo" class="brand" aria-label="${txt(c.negocio.nome)} — início">${image(c.negocio.logo, '', 'brand-logo','eager')}<span>${txt(c.negocio.nome).toUpperCase()}</span></a>
      <nav class="desktop-nav" aria-label="Menu principal">${navItems.map(([id,label])=>`<a href="#${id}">${label}</a>`).join('')}</nav>
      <div class="header-actions">${`<a class="header-cta" href="#escolher-unidade">ESCOLHER UNIDADE <span aria-hidden="true">↗</span></a>`}<button class="menu-toggle" type="button" aria-label="Abrir menu" aria-controls="mobile-nav" aria-expanded="false"><span></span><span></span></button></div>
    </div><nav class="mobile-nav" id="mobile-nav" aria-label="Menu para celular" hidden>${navItems.map(([id,label])=>`<a href="#${id}">${label}</a>`).join('')}</nav></header>
    <main id="conteudo"><section class="hero" aria-labelledby="hero-titulo">
      <div class="hero-image" ></div>
      <div class="hero-grain" aria-hidden="true"></div><div class="container hero-content"><div class="hero-kicker"><span class="kicker-line"></span>${txt(c.negocio.cidade)} <span class="tiny-dot"></span> ${txt(c.negocio.selo)}</div>
      <h1 id="hero-titulo">MAIS QUE<br><em>CORTE.</em><br><span>ATITUDE.</span></h1>
      <p>${txt(c.negocio.descricao)} ${txt(c.negocio.destaque)}</p><div class="hero-buttons">${cta()}<a class="btn btn-ghost" href="#servicos">Conhecer serviços <span aria-hidden="true">↓</span></a></div>
      <div class="hero-footer"><span>${txt(c.negocio.nome).toUpperCase()} / ${txt(c.negocio.cidade)}</span><span>ROLE PARA EXPLORAR ↓</span></div>
      </div><div class="hero-side" aria-hidden="true">EST. 43 · LONDRINA · BARBER CULTURE</div>
    </section><div class="marquee" aria-hidden="true"><div class="marquee-track">${Array(2).fill(`<div class="marquee-copy"><span>CORTE</span><i>✳</i><span>BARBA</span><i>✳</i><span>ATITUDE</span><i>✳</i></div>`).join('')}</div></div>
    ${choose}${services}${gallery}${about}${team}${reviews}${units}
    <section class="closing" aria-labelledby="closing-titulo"><div class="container closing-inner"><div class="eyebrow">PRONTO PRA RENOVAR O VISUAL?</div><h2 id="closing-titulo">SEU PRÓXIMO<br><span>CORTE COMEÇA AQUI.</span></h2>${cta()}</div></section>
    </main><footer class="footer"><div class="container"><div class="footer-upper"><div class="footer-name">${txt(c.negocio.nome).toUpperCase()}<span>®</span></div><div class="footer-right"><p>${txt(c.negocio.slogan)}<br>${txt(c.negocio.cidade)}</p><div class="socials">${socials.map(([name,url])=>link(url,name)).join('')}</div></div></div><div class="footer-bottom"><span>© <span id="year"></span> ${txt(c.negocio.nome)}.</span><span>${txt(c.rodape?.creditos || '')}</span><a href="#topo">VOLTAR AO TOPO ↑</a></div></div></footer>
    ${waUrl ? `<a class="floating-wa" href="${safeUrl(waUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Agendar pelo WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8A11.1 11.1 0 0 0 2.4 17.5L.8 23.2l5.9-1.5A11.2 11.2 0 1 0 12 .8zm0 20.3a9 9 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.4A9.1 9.1 0 1 1 12 21.1zm5-6.8c-.3-.2-1.6-.8-1.8-.9-.2-.1-.4-.2-.5.2-.2.3-.7.9-.8 1-.1.1-.3.1-.6 0a7.4 7.4 0 0 1-3.6-3.2c-.2-.3.2-.4.5-1 .1-.1.1-.3 0-.5l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4a2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.3 1 2.5a10.3 10.3 0 0 0 4 3.6c2.5 1.1 3.5 1 4.1.9.7-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3z"/></svg></a>` : ''}
  `;

  document.getElementById('year').textContent = new Date().getFullYear();
  const serviceContent = document.getElementById('service-content');
  function showUnit(id, scroll = false) {
    const unit = c.unidades.find(u => u.id === id) || c.unidades[0];
    if (serviceContent) serviceContent.innerHTML = serviceHTML(unit);
    document.querySelectorAll('.service-choice-button').forEach(b => {
      const active = b.dataset.unit === unit.id;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    if (scroll) document.getElementById('servicos')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  if (serviceContent) showUnit(firstUnit.id);
  document.querySelectorAll('[data-unit]').forEach(button => button.addEventListener('click',()=>showUnit(button.dataset.unit,button.classList.contains('choose-button'))));
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeMenu = () => { mobileNav.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menu'); document.body.classList.remove('menu-open'); };
  toggle.addEventListener('click', () => { const opening = mobileNav.hidden; mobileNav.hidden = !opening; toggle.setAttribute('aria-expanded',String(opening)); toggle.setAttribute('aria-label',opening?'Fechar menu':'Abrir menu'); document.body.classList.toggle('menu-open',opening); });
  mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMenu));
  window.addEventListener('keydown',e=>{ if(e.key==='Escape') closeMenu(); });
  window.addEventListener('resize',()=>{ if(window.innerWidth>=900) closeMenu(); });
  // Entrada gradual de elementos, desativada para quem prefere movimento reduzido.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);} }); }, {threshold:.08});
    document.querySelectorAll('.section-top,.service,.gallery-item,.about-copy,.unit,.person,.review,.closing-inner').forEach(el=>{el.classList.add('reveal');observer.observe(el);});
  }
})();
