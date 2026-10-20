import prepare from '../../examples/digits-project/prepare_data.py?raw';
import model from '../../examples/digits-project/user_models/research_cnn.py?raw';
import config from '../../examples/digits-project/configs/digits.yaml?raw';
import inspect from '../../examples/digits-project/inspect_run.py?raw';
import requirements from '../../examples/digits-project/requirements.txt?raw';
import readme from '../../examples/digits-project/README.md?raw';
import english from '../../examples/digits-project/README.en.md?raw';
import ignore from '../../examples/digits-project/.gitignore?raw';
import license from '../../examples/digits-project/LICENSE?raw';

/** Exact source files included in the ZIP and shown in the complete-case guide. */
export const projectFiles = [
  { path: 'prepare_data.py', source: prepare, pt: 'Preparação dos dados', en: 'Data preparation' },
  { path: 'user_models/research_cnn.py', source: model, pt: 'Arquitetura registrada', en: 'Registered architecture' },
  { path: 'configs/digits.yaml', source: config, pt: 'Configuração completa', en: 'Complete configuration' },
  { path: 'inspect_run.py', source: inspect, pt: 'Leitura dos resultados', en: 'Read recorded results' },
  { path: 'requirements.txt', source: requirements, pt: 'Dependências', en: 'Dependencies' },
  { path: '.gitignore', source: ignore, pt: 'Arquivos excluídos do Git', en: 'Files excluded from Git' },
  { path: 'README.md', source: readme, pt: 'Instruções em português', en: 'Portuguese instructions' },
  { path: 'README.en.md', source: english, pt: 'Instruções em inglês', en: 'English instructions' },
  { path: 'LICENSE', source: license, pt: 'Licença do código', en: 'Code license' },
];
