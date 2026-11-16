"""Valida catálogo e conteúdo JSON. Execute: python scripts/validar_listas.py"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / 'data/catalogo.json').read_text(encoding='utf-8'))
TYPES = {'vf', 'codigo', 'assercao', 'uml', 'multipla', 'sql', 'modelo'}
errors = []
for entry in CATALOG.get('listas', []):
    file = ROOT / entry['arquivo']
    if not file.is_file():
        errors.append(f"Lista não encontrada: {file}")
        continue
    data = json.loads(file.read_text(encoding='utf-8'))
    questions = data.get('questoes', [])
    if data.get('id') != entry['id']:
        errors.append(f"ID do catálogo não corresponde ao da lista: {entry['id']}")
    if len(questions) != entry['questoes']:
        errors.append(f"{entry['id']}: catálogo diz {entry['questoes']} questões, mas há {len(questions)}")
    ids = [q.get('id') for q in questions]
    if len(ids) != len(set(ids)):
        errors.append(f"{entry['id']}: IDs duplicados")
    for q in questions:
        prefix = f"{entry['id']} / questão {q.get('id')}"
        if q.get('tipo') not in TYPES:
            errors.append(f"{prefix}: tipo inválido")
        ops = q.get('opcoes', [])
        if len(ops) not in (2, 5):
            errors.append(f"{prefix}: necessário 2 ou 5 opções")
        correct = q.get('correta', -1)
        if not isinstance(correct, int) or not 0 <= correct < len(ops):
            errors.append(f"{prefix}: índice da opção correta inválido")
        if not q.get('acerto'):
            errors.append(f"{prefix}: falta explicação de acerto")
        if not q.get('fonte', {}).get('local'):
            errors.append(f"{prefix}: falta localização do material")
        if q.get('diagrama') and q['diagrama'] not in data.get('diagramas', {}):
            errors.append(f"{prefix}: diagrama inexistente")
        for t in q.get('tabelas', []):
            if t not in data.get('tabelasDados', {}):
                errors.append(f"{prefix}: tabela de dados inexistente ({t})")
        for i, option in enumerate(ops):
            if not option.get('texto'):
                errors.append(f"{prefix}: alternativa {i+1} sem texto")
            if i != correct and not option.get('porque'):
                errors.append(f"{prefix}: alternativa {i+1} errada sem justificativa")
    print(f"OK: {entry['id']}: {len(questions)} questões")
if errors:
    print('\n'.join('ERRO: '+e for e in errors))
    raise SystemExit(1)
print('Validação concluída sem erros.')
