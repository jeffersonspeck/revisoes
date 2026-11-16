/* Listas Interativas: catálogo e correção local, sem dependências externas.
   Cada lista é um JSON registrado em data/catalogo.json. */
(() => {
  'use strict';

  const page = document.body.dataset.page;
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const typeLabels = { vf: 'Verdadeiro ou falso', codigo: 'Interpretação de código', assercao: 'Asserção e razão', uml: 'Diagrama UML', multipla: 'Múltipla escolha', sql: 'Interpretação de SQL', modelo: 'Modelo de tabelas' };
  const $ = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const absUrl = path => new URL(path, document.baseURI).href;

  async function fetchJson(path) {
    const response = await fetch(absUrl(path), { cache: 'no-cache' });
    if (!response.ok) throw new Error('Não foi possível carregar ' + path + ' (HTTP ' + response.status + ').');
    return response.json();
  }
  function errorMessage(target, error) {
    target.replaceChildren();
    const card = $('div', 'empty-state');
    card.append($('h2', null, 'Não foi possível carregar esta lista.'));
    card.append($('p', null, 'Verifique a publicação dos arquivos JSON. Para testar no computador, inicie um servidor local (instruções no README).'));
    const detail = $('p', 'muted', error.message || 'Falha no carregamento.');
    card.append(detail);
    const back = $('a', 'button-primary', 'Voltar ao catálogo');
    back.href = 'index.html';
    card.append(back);
    target.append(card);
  }
  function keyFor(list) { return `listas-interativas:${list.id}:v${list.versao || 1}`; }
  function readProgress(list) {
    try {
      const json = localStorage.getItem(keyFor(list));
      const value = json ? JSON.parse(json) : {};
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  }
  function saveProgress(list, progress) {
    try { localStorage.setItem(keyFor(list), JSON.stringify(progress)); }
    catch { /* Sem armazenamento: a sessão continua funcional. */ }
  }
  function stats(list, progress) {
    let answered = 0, correct = 0, wrong = 0;
    for (const q of list.questoes) {
      if (!Object.prototype.hasOwnProperty.call(progress, String(q.id))) continue;
      answered++;
      if (progress[q.id].resposta === q.correta) correct++;
      else wrong++;
    }
    return { answered, correct, wrong, total: list.questoes.length };
  }
  async function startCatalog() {
    const holder = document.getElementById('catalogo');
    try {
      const catalog = await fetchJson('data/catalogo.json');
      holder.replaceChildren();
      if (!Array.isArray(catalog.listas) || catalog.listas.length === 0) {
        holder.append($('p', 'loading', 'Nenhuma lista cadastrada.')); return;
      }
      for (const entry of catalog.listas) {
        const card = $('article', 'catalog-card');
        const top = $('div', 'catalog-top');
        top.append($('div', 'catalog-icon', entry.icone || '</>'));
        top.append($('span', 'small-pill', `${entry.questoes || 'Várias'} QUESTÕES`));
        card.append(top);
        card.append($('h3', null, entry.titulo));
        card.append($('p', null, entry.descricao));
        const tags = $('div', 'tags');
        for (const tag of (entry.tags || [])) tags.append($('span', 'tag', tag));
        card.append(tags);
        const foot = $('div', 'card-foot');
        const link = $('a', null, 'Acessar exercícios ↗');
        link.href = `lista.html?lista=${encodeURIComponent(entry.id)}`;
        const p = readProgress(entry);
        const done = Object.keys(p).length;
        foot.append(link, $('span', 'card-progress', done ? `${done}/${entry.questoes} respondidas` : 'Pronta para começar'));
        card.append(foot);
        holder.append(card);
      }
    } catch (error) { errorMessage(holder, error); }
  }
  function sourceDetails(source) {
    const details = $('details', 'source-toggle');
    const summary = $('summary', null, 'Onde revisar este conteúdo');
    details.append(summary);
    const body = $('div', 'source-body');
    body.append($('div', null, source.titulo));
    body.append($('div', null, source.local));
    if (source.url) {
      const link = $('a', null, 'Abrir material no GitHub ↗');
      link.href = source.url;
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      body.append(link);
    } else {
      body.append($('div', null, 'Consulte o PDF utilizado nas aulas.'));
    }
    details.append(body);
    return details;
  }
  function classBox(def) {
    const node = $('div', 'uml-class');
    node.append($('div', 'uml-class-name', def.nome));
    const attr = $('div', 'uml-section');
    for (const x of def.atributos) attr.append($('div', null, x));
    node.append(attr);
    const methods = $('div', 'uml-section');
    for (const x of def.metodos) methods.append($('div', null, x));
    node.append(methods);
    return node;
  }
  /* Modelo relacional: tabelas com colunas (PK/FK) e lista de relacionamentos. */
  function erBox(def) {
    const outer = $('div', 'er-diagram');
    outer.setAttribute('role', 'group');
    outer.setAttribute('aria-label', def.legenda);
    const grid = $('div', 'er-grid');
    for (const t of def.tabelas) {
      const box = $('div', 'er-table');
      box.append($('div', 'er-table-name', t.nome));
      for (const c of t.colunas) {
        const row = $('div', 'er-col');
        const key = $('span', 'er-key' + (c.chave ? ' er-key-' + c.chave.toLowerCase().replace(/[^a-z]/g, '') : ''), c.chave || '');
        row.append(key, $('span', 'er-col-name', c.nome), $('span', 'er-col-type', c.tipo || ''));
        box.append(row);
      }
      grid.append(box);
    }
    outer.append(grid);
    if (def.relacoes && def.relacoes.length) {
      const rels = $('ul', 'er-rels');
      for (const r of def.relacoes) {
        const li = $('li');
        li.append($('code', null, r.de), $('span', 'er-arrow', ' → '), $('code', null, r.para));
        if (r.card) li.append($('span', 'er-card', r.card));
        rels.append(li);
      }
      outer.append(rels);
    }
    outer.append($('div', 'uml-legend', def.legenda));
    return outer;
  }
  /* Tabelas com dados de exemplo (registros) usadas pela questão. */
  function dataTables(names, list) {
    const holder = $('div', 'data-tables');
    for (const name of names) {
      const t = (list.tabelasDados || {})[name];
      if (!t) continue;
      const wrap = $('div', 'data-wrap');
      const table = $('table', 'data-table');
      table.append($('caption', null, t.titulo || name));
      const head = $('tr');
      for (const c of t.colunas) head.append($('th', null, c));
      const thead = $('thead'); thead.append(head); table.append(thead);
      const tbody = $('tbody');
      for (const r of t.linhas) {
        const tr = $('tr');
        for (const v of r) {
          const td = $('td', v === null ? 'is-null' : null, v === null ? 'NULL' : v);
          tr.append(td);
        }
        tbody.append(tr);
      }
      table.append(tbody);
      wrap.append(table);
      holder.append(wrap);
    }
    return holder;
  }
  function diagramBox(def) {
    if (def.tipo === 'er') return erBox(def);
    const outer = $('div', 'uml-diagram');
    outer.setAttribute('role','group');
    outer.setAttribute('aria-label',def.legenda);
    const row = $('div', 'uml-row');
    const line = $('div', 'uml-connection');
    line.append($('span', 'uml-multi', def.esqMulti), $('span', 'uml-multi', def.dirMulti));
    row.append(classBox(def.esquerda), line, classBox(def.direita));
    outer.append(row, $('div', 'uml-legend', def.legenda));
    return outer;
  }
  function questionCard(q, list, progress) {
    const article = $('article', 'question');
    article.id = `questao-${q.id}`;
    const top = $('div', 'q-top');
    top.append($('span', 'q-index', `QUESTÃO ${String(q.id).padStart(2, '0')} / ${list.questoes.length}`));
    top.append($('span', 'q-type', q.afirmativa ? 'Asserção e razão' : typeLabels[q.tipo] || q.tipo));
    article.append(top);
    article.append($('p', 'q-meta', q.topico.toUpperCase()));
    article.append($('h3', 'q-title', q.pergunta));
    if (q.afirmativa) {
      const claims = $('div', 'q-claims');
      const i = $('p'); i.append($('strong', null, 'I. '), document.createTextNode(q.afirmativa));
      const porque = $('span', 'porque', 'PORQUE');
      const ii = $('p'); ii.append($('strong', null, 'II. '), document.createTextNode(q.razao));
      claims.append(i, porque, ii);
      article.append(claims);
    }
    if (q.diagrama && list.diagramas[q.diagrama]) article.append(diagramBox(list.diagramas[q.diagrama]));
    if (Array.isArray(q.tabelas) && q.tabelas.length) article.append(dataTables(q.tabelas, list));
    if (q.codigo) {
      const code = $('pre', 'code-block');
      code.append($('code', null, q.codigo));
      article.append(code);
    }
    if (q.complemento) article.append($('p', 'q-note', q.complemento));
    const choices = $('div', 'answer-options');
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', `Alternativas da questão ${q.id}`);
    q.opcoes.forEach((choice, index) => {
      const btn = $('button', 'answer-option');
      btn.type = 'button';
      btn.dataset.answer = String(index);
      const letter = q.tipo === 'vf' ? ['V','F'][index] : letters[index];
      btn.append($('span', 'choice-letter', letter), q.opcoesCodigo ? $('code', 'option-code', choice.texto) : $('span', null, choice.texto));
      btn.addEventListener('click', () => {
        if (progress[q.id]) return;
        progress[q.id] = { resposta: index };
        saveProgress(list, progress);
        paintAnswer(article, q, progress);
        updateStats(list, progress);
      });
      choices.append(btn);
    });
    article.append(choices);
    const feedback = $('div', 'feedback');
    feedback.hidden = true;
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    article.append(feedback);
    const footer = $('div', 'q-footer');
    footer.append(sourceDetails(q.fonte));
    const reset = $('button', 'reset-one', 'Refazer questão');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      delete progress[q.id];
      saveProgress(list, progress);
      paintAnswer(article, q, progress);
      updateStats(list, progress);
    });
    reset.hidden = true;
    footer.append(reset);
    article.append(footer);
    paintAnswer(article, q, progress);
    return article;
  }
  function paintAnswer(article, q, progress) {
    const selection = progress[q.id]?.resposta;
    const completed = Number.isInteger(selection);
    const good = completed && selection === q.correta;
    const buttons = article.querySelectorAll('.answer-option');
    buttons.forEach((b, i) => {
      b.disabled = completed;
      b.classList.remove('chosen-correct', 'chosen-wrong', 'show-correct', 'dimmed');
      b.setAttribute('aria-pressed', String(completed && i === selection));
      if (completed) {
        if (i === selection) b.classList.add(good ? 'chosen-correct' : 'chosen-wrong');
        else if (i === q.correta) b.classList.add('show-correct');
        else b.classList.add('dimmed');
      }
    });
    const area = article.querySelector('.feedback');
    area.replaceChildren();
    area.hidden = !completed;
    area.className = 'feedback' + (good ? ' ok' : ' bad');
    if (completed) {
      area.append($('strong', null, good ? '✓ Correto.' : '✕ Ainda não.'));
      if (good) {
        area.append($('p', null, q.acerto));
      } else {
        const option = q.opcoes[selection];
        area.append($('p', null, option.porque || 'Essa alternativa não corresponde ao comportamento apresentado.'));
        const right = $('p', 'right-answer');
        const letter = q.tipo === 'vf' ? ['V','F'][q.correta] : letters[q.correta];
        right.textContent = `Resposta: ${letter} — ${q.acerto}`;
        area.append(right);
      }
    }
    article.querySelector('.reset-one').hidden = !completed;
  }

  let currentStatus = 'todas';
  let currentTopic = 'todos';
  let activeList, activeProgress;

  function renderItems(list, progress) {
    const holder = document.getElementById('questoes');
    holder.replaceChildren();
    const items = list.questoes.filter(q => {
      const p = progress[q.id];
      if (currentTopic !== 'todos' && currentTopic !== q.topico) return false;
      if (currentStatus === 'pendentes' && p) return false;
      if (currentStatus === 'corretas' && (!p || p.resposta !== q.correta)) return false;
      if (currentStatus === 'erradas' && (!p || p.resposta === q.correta)) return false;
      return true;
    });
    document.getElementById('visible-count').textContent = `${items.length} ${items.length === 1 ? 'questão' : 'questões'} exibidas`;
    if (!items.length) {
      const note = $('div', 'empty-state');
      note.append($('h3', null, 'Nada neste filtro.'));
      note.append($('p', null, 'Altere o tema ou o filtro de respostas para ver outras questões.'));
      holder.append(note);
      return;
    }
    for (const q of items) holder.append(questionCard(q, list, progress));
  }
  function updateStats(list, progress) {
    const s = stats(list, progress);
    const percent = Math.round(100 * s.answered / s.total);
    const circle = document.getElementById('progress-circle');
    circle.style.setProperty('--progress', `${percent * 3.6}deg`);
    document.getElementById('progress-percent').textContent = percent + '%';
    document.getElementById('count-answered').textContent = s.answered;
    document.getElementById('count-correct').textContent = s.correct;
    document.getElementById('count-wrong').textContent = s.wrong;
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('refazer-erradas').disabled = s.wrong === 0;
    const complete = document.getElementById('completion');
    complete.hidden = s.answered !== s.total;
    if (s.answered === s.total) complete.querySelector('p').textContent = `Resultado: ${s.correct} acertos e ${s.wrong} erros. Use “Refazer erradas” para praticar os conteúdos que precisam de revisão.`;
  }
  function activateFilter(status) {
    currentStatus = status;
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === status);
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === status));
    });
    renderItems(activeList, activeProgress);
  }
  function sourceLinks(list) {
    const ul = $('ul', 'source-list');
    for (const x of (list.fontesGerais || [])) {
      const li = $('li');
      if (x.url) {
        const link = $('a', null, x.titulo + ' ↗'); link.href = x.url;
        link.target = '_blank'; link.rel = 'noopener noreferrer'; li.append(link);
      } else li.append($('strong', null, x.titulo));
      li.append($('span', null, x.descricao));
      ul.append(li);
    }
    return ul;
  }
  function createListView(list) {
    const root = document.getElementById('list-page');
    root.replaceChildren();
    const hero = $('section', 'list-hero');
    const heroIn = $('div', 'wrap');
    const back = $('a', 'back-link', '← Voltar às listas'); back.href = 'index.html';
    heroIn.append(back, $('p', 'eyebrow', 'LISTA DE EXERCÍCIOS'));
    heroIn.append($('h1', null, list.titulo), $('p', null, list.subtitulo));
    const meta = $('div', 'hero-meta');
    meta.append($('span', null, `${list.questoes.length} questões`), $('span', null, 'Correção imediata'), $('span', null, 'Com referências'));
    heroIn.append(meta); hero.append(heroIn); root.append(hero);
    const section = $('section', 'study-area');
    const wrap = $('div', 'wrap');
    const layout = $('div', 'study-layout');
    const left = $('div');
    const top = $('div', 'study-topbar');
    top.append($('h2', null, 'Hora de praticar'));
    const number = $('span', 'muted', `${list.questoes.length} questões exibidas`); number.id = 'visible-count'; top.append(number);
    left.append(top);
    const filters = $('div', 'control-row');
    const definitions = [['todas','Todas'],['pendentes','Não respondidas'],['erradas','Erradas'],['corretas','Corretas']];
    for (const [value,label] of definitions) {
      const btn = $('button', 'filter-button'+(value === currentStatus ? ' active':''),label);
      btn.type='button'; btn.dataset.filter=value; btn.setAttribute('aria-pressed',String(value===currentStatus));
      btn.addEventListener('click',()=>activateFilter(value)); filters.append(btn);
    }
    left.append(filters);
    const selectGroup = $('div','control-row');
    const sel = $('select','filter-button');
    sel.setAttribute('aria-label','Filtrar por assunto');
    const optAll=$('option',null,'Todos os assuntos'); optAll.value='todos'; sel.append(optAll);
    for(const topic of [...new Set(list.questoes.map(q=>q.topico))]) { const o=$('option',null,topic);o.value=topic;sel.append(o); }
    sel.addEventListener('change',()=>{currentTopic=sel.value;renderItems(list,activeProgress);});
    selectGroup.append(sel);left.append(selectGroup);
    const questionHolder = $('div','question-list'); questionHolder.id='questoes';left.append(questionHolder);
    const completion = $('div','completion');completion.id='completion';completion.hidden=true;
    completion.append($('strong',null,'Lista concluída.'));completion.append($('p',null,''));left.append(completion);
    const right = $('aside','side-panel'); right.setAttribute('aria-label','Progresso e materiais');
    const track=$('section','panel-card');track.append($('h3',null,'Seu progresso'));
    const progressRow=$('div','progress-row');
    const circle=$('div','progress-circle');circle.id='progress-circle';circle.style.setProperty('--progress','0deg');
    const inner=$('div','progress-inner','0%'); inner.id='progress-percent';circle.append(inner);
    const score=$('div','score');
    const lines=[['Respondidas','count-answered'],['Acertos','count-correct'],['Erros','count-wrong']];
    for(const [txt,id] of lines){const row=$('div');row.append(document.createTextNode(txt+': '));const n=$('strong',null,'0');n.id=id;row.append(n);score.append(row);}
    progressRow.append(circle,score);track.append(progressRow);
    const bar=$('div','progress-bar');const fill=$('div');fill.id='progress-fill';bar.append(fill);track.append(bar);
    track.append($('p','side-note','As respostas ficam salvas neste navegador.'));
    const next=$('button','action-button','Ir à próxima não respondida');next.type='button';
    next.addEventListener('click',()=>{
      currentTopic='todos';sel.value='todos';activateFilter('todas');
      const nextQ=list.questoes.find(q=>!activeProgress[q.id]);
      if(nextQ) document.getElementById('questao-'+nextQ.id)?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    track.append(next);
    const redo=$('button','action-button','Refazer somente as erradas');redo.id='refazer-erradas';redo.type='button';
    redo.addEventListener('click',()=>{for(const q of list.questoes) if(activeProgress[q.id]&&activeProgress[q.id].resposta!==q.correta)delete activeProgress[q.id];saveProgress(list,activeProgress);renderItems(list,activeProgress);updateStats(list,activeProgress);});
    track.append(redo);
    const reset=$('button','action-button danger','Zerar esta lista');reset.type='button';
    reset.addEventListener('click',()=>{if(!window.confirm('Apagar todas as respostas desta lista neste navegador?'))return;activeProgress={};saveProgress(list,activeProgress);renderItems(list,activeProgress);updateStats(list,activeProgress);});
    track.append(reset);
    right.append(track);
    const refs=$('section','panel-card');refs.append($('h3',null,'Materiais de referência'),sourceLinks(list));right.append(refs);
    layout.append(left,right);wrap.append(layout);section.append(wrap);root.append(section);
    renderItems(list,activeProgress);
    updateStats(list,activeProgress);
  }
  async function startList() {
    const root = document.getElementById('list-page');
    try {
      const listId=new URLSearchParams(window.location.search).get('lista');
      const catalog=await fetchJson('data/catalogo.json');
      const entry=(catalog.listas||[]).find(x=>x.id===listId);
      if(!entry)throw new Error('Lista não encontrada no catálogo.');
      const list=await fetchJson(entry.arquivo);
      if (list.id !== entry.id || !Array.isArray(list.questoes) || !list.questoes.length) throw new Error('Formato de lista inválido.');
      document.title=list.titulo+' | Listas Interativas';
      activeList=list;activeProgress=readProgress(list);
      createListView(list);
    } catch(error) { errorMessage(root,error); }
  }
  if(page==='home') startCatalog();
  else if(page==='list') startList();
})();
