# Profissionalização do Controle de Abastecimento

## Situação atual verificada
- O sistema já utiliza Lovable Cloud com PostgreSQL permanente e armazenamento privado de fotos. Não é necessário trocar o banco.
- As tabelas atuais são `fuel_logs` (abastecimentos), `tank_levels` (medições), `fuel_requests` (pedidos) e `audit_logs` (auditoria). Não existem tabelas próprias de veículos, motoristas ou perfis de usuários.
- A entrada anônima de testes foi desativada durante a transição anteriormente autorizada; a entrada permanente da Etapa 1 ainda precisa ser implementada. Nenhuma implementação adicional será feita até a aprovação deste plano revisado.
- Há atualização em tempo real na Gestão e exportação operacional Excel sem fotos. Perfis ADM/colaborador e gerenciamento de usuários ainda estão pendentes; a auditoria já contém o resumo único da Limpeza A.
- Ipiranga e Itaquera já são aceitos pelo banco; os ajustes anteriores de importação e indicadores ainda estão pendentes.
- O documento recebido termina com uma frase incompleta na seção 10. Este plano cobre os requisitos completos recebidos e preserva o estilo atual.
- **Limpeza A já executada sob autorização anterior:** os 677 registros eram testes e foram apagados após entrega dos três CSVs. A contagem inicialmente informada era de 37 contas anônimas; no momento da execução havia **38 anônimas**, que foram removidas, e uma não anônima preservada. Também foram removidas 22 fotos privadas. Não repetir a limpeza automaticamente.
- **Conferência nesta revisão:** zero registros nas três tabelas, zero fotos no bucket privado, zero contas anônimas e uma conta não anônima. Há exatamente um resumo da Limpeza A, registrado em **12/10/2026 às 01:27:28 UTC**, com autor e quantidades. Conta preservada: **heliaquimsamuel@gmail.com**, criação em **09/10/2026 às 12:31:28 UTC (09:31:28 em São Paulo)**, último acesso não registrado. A limpeza não lhe concedeu ADM.

## 1. Acesso permanente e perfis
- Entrada individual por **usuário curto e senha** para auxiliares e administradores criados pelo sistema. Converter o usuário normalizado em endereço interno sob `users.invalid`, domínio reservado e não entregável. Não enviar convites, confirmações ou recuperação por e-mail a essas contas; cadastro público e login anônimo permanecem desligados. Confirmar apenas as contas provisionadas pelo fluxo administrativo, sem confirmação automática global.
- Criar perfis de usuário e papéis ADM/colaborador separados. Aplicar autorização no servidor e no banco, além da navegação.
- **Primeiro administrador:** usar somente a conta existente `heliaquimsamuel@gmail.com`, preservando recuperação pelo e-mail real como emergência. Atualizar a senha por operação privilegiada de uso único com o valor expressamente autorizado, sem escrevê-lo no código, auditoria ou relatório. Não impor troca obrigatória nessa conta. Não criar outra conta inicial.
- Consumir a marca permanente de inicialização na mesma transação que atribui ADM ao identificador da conta existente, com proteção contra concorrência e auditoria. A alteração de senha usa a API Auth, separada da transação dos papéis: não afirmar atomicidade entre esses serviços. Inicialização somente pela implantação privilegiada, nunca função pública; revogar/remover o mecanismo temporário depois. O e-mail sozinho, metadados e parâmetros do navegador não concedem ADM.
- Comprovar no relatório que a segunda execução da inicialização é rejeitada, inclusive em paralelo, e que visitante/colaborador não podem chamar esse caminho nem alterar a marca ou os papéis. Se não houver evidência, marcar **não verificado**, nunca declarar a proteção comprovada.
- Redefinições de qualquer conta criada pelo sistema serão feitas por ADM ativo em Gerenciar Usuários. Alterar minha senha fica disponível a todos. Troca obrigatória no primeiro acesso somente para auxiliares novos, se suportada; informar limitações.
- Criar **Gerenciar Usuários** exclusivo ADM. A primeira escolha será **Auxiliar (colaborador)** ou **Administrador**, alterando os campos do formulário:
  - Auxiliar: nome, usuário curto único e senha inicial com mínimo de 6 caracteres.
  - Administrador: nome, usuário curto único e senha inicial com mínimo de 10 caracteres; exigir confirmação extra.
- Exigir confirmação extra antes de criar um administrador e registrar quem autorizou sua criação.
- Permitir mudar o tipo de outros usuários, ativar, desativar e redefinir senha. Impedir que qualquer usuário altere o próprio tipo; impedir desativação ou rebaixamento do último administrador ativo, inclusive em ações simultâneas.
- Exibir lista com nome, tipo, estado ativo/inativo, data de criação e último acesso confirmado. Quando não houver acesso registrado, mostrar “Nunca acessou”, sem inventar datas.
- Auditar toda criação, mudança de tipo, ativação, desativação e redefinição de senha, com autor, usuário afetado e horário; nunca registrar senhas na auditoria.
- A autorização da Limpeza A substitui a preservação dos 677 registros antigos e das contas anônimas. Preservar a conta não anônima e todos os dados posteriores não abrangidos por nova autorização; não converter testes em dados operacionais.
- Criar uma tela de entrada simples para celular, com campos e botões grandes e controle “Mostrar senha”. Manter “Sair” sempre visível nas telas da sessão autenticada.
- Solicitar persistência da sessão no aparelho por 30 dias, com renovação automática, sem expiração por inatividade e continuidade mínima de duas horas. Validar as opções efetivamente suportadas antes de afirmar que esse prazo está garantido. Explicar a diferença entre o prazo de 30 dias e “só sair ao clicar em Sair”: desativação, revogação de segurança, limpeza do navegador ou expiração obrigatória também podem encerrar o acesso.
- Ao desativar uma conta, bloquear imediatamente novas operações no servidor e no banco, mesmo com um token anterior. Revogar as sessões e sinalizar a desativação à tela conectada; verificar o tempo observado de saída, sem prometer entrega instantânea quando o aparelho estiver sem conexão.
- Bloqueio de tentativas é a última prioridade da Etapa 1 e depende de suporte confiável; distinguir proteção nativa de contagem própria e documentar desvios pela autenticação direta.
- Colaboradores ativos consultam somente os próprios registros; administradores ativos consultam todos. Visitantes e sessões anônimas de teste não terão acesso operacional. Aplicar essa regra às consultas, anexos, importação, exportação e atualização em tempo real, preservando os dados antigos sem torná-los públicos.
- Manter **login anônimo e cadastro público desativados** nas configurações do serviço de autenticação, não apenas na tela. Somente o fluxo administrativo autorizado poderá criar contas, além da implantação única do primeiro ADM. Confirmar por leitura das configurações e tentativas reais de cadastro público e login anônimo; mostrar o estado final no relatório. As contas anônimas antigas foram excluídas, não preservadas.
- Definir senhas com **mínimo de 10 caracteres para administradores e 6 para auxiliares**, bloqueando senhas triviais, incluindo `123456`, `000000`, `senha` e o próprio usuário. Aplicar a regra por tipo verificado no banco na criação, redefinição e alteração de senha, incluindo promoção de auxiliar a ADM; exigir adequação da senha antes de liberar privilégios de ADM. Verificar suporte nativo à diferenciação por tipo e à lista personalizada. Informar qualquer proteção que não possa ser garantida no serviço e nos caminhos diretos, sem confundir proteção contra senhas vazadas com lista personalizada.
- Aplicar bloqueio de cinco minutos após cinco erros somente se confiável. Testar caminho direto do serviço; se contornar, informar claramente **não protegido**, sem alegar obrigatoriedade do servidor. Não criar autenticação paralela nem validar senhas manualmente.
- Disponibilizar **Alterar minha senha** a todos, solicitando senha atual no fluxo normal. Exigência de troca inicial apenas para auxiliares criados depois, se suportada; nunca para o primeiro ADM. A exigência será estado protegido no banco, não decisão do navegador. Recuperação por e-mail somente da conta real de emergência.

## 2. Pedidos e integridade dos abastecimentos
- Retirar da tela **Pedir Combustível** o campo de última entrega, mantendo o aviso crítico e os demais campos.
- Preservar a coluna e os valores antigos. Adaptar a gravação sem inventar datas de entrega para novos pedidos.
- Manter abastecimentos enviados bloqueados para edição/exclusão por colaboradores, inclusive por chamadas diretas.
- Exibir a mensagem solicitada após o envio e em tentativas de alteração não autorizadas.
- Permitir que ADM edite e exclua abastecimentos e demais registros operacionais, sempre com motivo obrigatório. Toda ação deve preservar na auditoria uma cópia completa anterior e posterior; em exclusões, registrar a cópia anterior completa e estado posterior ausente. Remoções administrativas devem preservar a rastreabilidade e não provocar exclusões em cascata de históricos ou contas.
- Auditoria é exceção: nem ADM pode alterá-la ou apagá-la pela aplicação. A operação e sua auditoria devem ocorrer na mesma transação; falha na auditoria impede a edição/exclusão.

## 3. Medições e página inicial
- Ampliar o histórico existente com turno manhã/noite, observação opcional e identificador de reenvio para evitar duplicações.
- Exigir quantidade maior que zero e registrar responsável e criação no servidor. Preservar medições antigas sem inventar turnos que não foram registrados.
- Definir a medição mais recente pela data/hora efetiva, com desempate por criação e identificador. Nunca somar medições ou calcular saldo por entradas/saídas sem regra aprovada.
- Criar a página inicial operacional com **Controle do Tanque de Combustível**, por tanque: última medição, data/hora, turno, responsável, histórico recente e horário da atualização.
- Mostrar carregamento, ausência de medições, falhas e reconexão sem apresentar zero como saldo fictício.
- Refletir registros confirmados entre usuários autorizados em tempo real; usar atualização de contingência documentada quando a conexão cair.

## 4. Exportação administrativa
- Criar **Exportar dados** exclusivo ADM, com um CSV por tabela da aplicação, todos os campos e todas as linhas, sem o limite de consulta da interface.
- Criar **Exportar tudo**, reunindo os CSVs em um único ZIP. Incluir perfis, papéis e auditoria após sua criação, além das três tabelas atuais.
- Incluir as tabelas de veículos e motoristas quando forem criadas na etapa posterior de cadastros; não inventar veículos, motoristas ou informações reais para preencher os arquivos.
- Exportar dados de usuários necessários para conferência, nunca senhas, hashes, tokens, sessões ou chaves privadas. As tabelas internas do serviço de autenticação não serão exportadas integralmente.
- Manter o Excel operacional limpo separado da exportação administrativa completa. A exportação administrativa pode conter campos de anexos existentes; não será um backup dos arquivos das fotos.

## 5. Pendências já solicitadas
- Concluir o mapeamento de colunas e normalização dos nomes legados de tanques na importação XLSX/CSV.
- Ampliar seletores e indicadores para Ipiranga/Itaquera, preservando Leste/Norte como locais independentes.
- Mostrar consumo em litros, média em litros por veículo e filtro por base, sem confundir consumo com medição do tanque.
- Criar cadastros permanentes de **veículos** (placa única em maiúsculas, tipo e capacidade) e **motoristas**, com seleção em lista nos formulários, sem fabricar cadastros a partir de informações incompletas.
- Aplicar no banco as validações dos lançamentos: litros maiores que zero, hodômetro não inferior ao último do mesmo veículo, data não futura, identificador de reenvio único e valores numeric/decimal. Usar America/Sao_Paulo para entrada e exibição das datas, mantendo instantes armazenados com fuso.
- Preservar históricos que não atendam às novas regras; analisar e adaptar os dados antes de validar novas restrições. Comparações de hodômetro e duplicidade devem ser protegidas contra lançamentos simultâneos; definir o tratamento de importações históricas sem invalidá-las indevidamente.

## 6. Conferência, documentação e recuperação
- Documentar tabelas, relacionamentos, acesso autorizado pelo painel do Lovable Cloud, exportação e conferência de persistência.
- Verificar quais backups, retenção e restauração são efetivamente oferecidos/configurados. Informar dependências de plano ou configuração manual; não afirmar que exportações substituem backup restaurável.
- Testar permissões com ADM e colaborador, bloqueio de chamadas diretas, desativação, correções auditadas, reenvios, persistência após nova entrada e sincronização entre duas sessões. Validar também entrada por usuário curto, unicidade do usuário, os dois formulários de criação, confirmação extra de ADM, proibição de mudança do próprio tipo, proteção concorrente do último ADM ativo, último acesso e auditoria de todas as ações de conta.
- Validar importação, exportações completas e ausência de credenciais nos arquivos. Não publicar ou declarar operação em produção antes da validação.

## Execução por etapas — implementar somente a Etapa 1
- **Etapa 1, ordem aprovada:** (1) login e primeiro ADM existente; (2) profiles/user_roles, RLS, conta ativa e auditoria transacional de edição/exclusão com motivo; (3) Gerenciar Usuários; (4) entrada móvel, Sair e sessão até 30 dias; (5) senhas por tipo e Alterar minha senha; (6) verificar bloqueio de tentativas. Sem extras e sem etapas posteriores. Se houver bloqueio ou limite de execução, registrar precisamente o item incompleto, sem declarar concluído.
- Ao concluir, apresentar as políticas RLS de **todas as tabelas da aplicação**, as políticas de acesso aos anexos e o inventário das **funções do banco com privilégio elevado**, incluindo finalidade, permissões de execução e verificações de autorização. Mostrar o resultado **passou, falhou ou não verificado** de cada teste abaixo, com evidência. Se faltar uma conta, configuração ou condição de teste, explicar o impedimento e nunca declarar que passou:
  1. Visitante sem login não lê dados da aplicação.
  2. Colaborador não edita nem exclui, inclusive por chamada direta.
  3. Colaborador não acessa Gerenciar Usuários nem suas operações diretas.
  4. Usuário desativado perde imediatamente autorização; medir também o encerramento da tela conectada.
  5. Último ADM ativo não pode ser desativado ou rebaixado, inclusive com ações simultâneas.
  6. Sessão continua aberta após fechar e reabrir o navegador com o mesmo perfil de armazenamento; verificar renovação e não confundir esse teste com comprovação de 30 dias decorridos.
  7. Exclusão por ADM exige motivo e grava cópia completa na auditoria imutável.
  8. Cadastro público e login anônimo estão desativados no serviço e rejeitam chamadas diretas.
  9. Política de senha, Alterar minha senha e troca inicial obrigatória funcionam nos caminhos suportados; listar limitações observadas.
  10. Bloqueio de cinco minutos ocorre após cinco erros e não pode ser contornado pelo caminho direto de autenticação sem que a limitação seja informada.
  11. Senhas de ADM abaixo de 10 caracteres, de auxiliar abaixo de 6 e senhas triviais são rejeitadas nos caminhos avaliados; verificar também promoção e recuperação.
  12. O primeiro ADM usa somente a conta existente e inicialização única; reexecução, concorrência e chamadas sem autorização não permitem autopromoção.
- **Limpeza A — procedimento autorizado e já concluído:** (a) exportar e entregar CSVs completos das três tabelas; (b) mostrar contagens de registros e contas; (c) apagar todos os registros de teste em lote, numa única transação com apenas um resumo de auditoria contendo quantidades, data e autor, antes de ativar auditoria por registro; remover as fotos privadas associadas; (d) conferir zero registros e zero fotos órfãs. Os CSVs entregues são `fuel_logs_antes_limpeza_A.csv`, `fuel_requests_antes_limpeza_A.csv` e `tank_levels_antes_limpeza_A.csv`. Não apagar tabelas, colunas, políticas ou configurações. A desativação da entrada anônima/cadastro público pertence à transição de autenticação, não à exclusão de dados.
- **Limite da operação única:** registros e resumo são transacionais no banco; arquivos físicos e contas exigem as APIs de Storage/Auth e não compartilham essa transação. Não excluir apenas metadados de fotos no banco nem afirmar atomicidade entre serviços. A conferência final cobre cada serviço; eventuais falhas devem ser informadas e tratadas sem repetir exclusões de dados novos.
- **Contas na Limpeza A:** excluir todas as contas anônimas existentes no instante conferido e revogar suas sessões; preservar somente a conta não anônima, informar e-mail/criação/último acesso e não lhe atribuir ADM. Registrar a diferença entre as 37 inicialmente contadas e as 38 efetivamente encontradas e removidas, sem esconder a divergência.
- **Limpeza B:** somente mediante novo pedido após validação da Etapa 1; identificar os registros e contas do ensaio por `is_test` e placa `TST1A23`, informar quantidades antes/depois, nunca executar automaticamente.
- Após a Limpeza A, usar **somente registros novos identificados como teste** nos testes de edição/exclusão; não presumir autorização para descartar registros ou contas criados após essa limpeza.
- O identificador solicitado “TESTE” não atende à validação atual de placa. Usar “TESTE” como identificação do cenário, com `is_test=true` e placa válida reservada para o ensaio, como `TST1A23`, sem enfraquecer a regra de placas de produção. Documentar no relatório a identificação e os registros criados para o teste. Contas de teste serão criadas pelo fluxo administrativo e identificadas no relatório, sem revelar senhas.
- **Ponto de parada obrigatório:** aguardar sua validação da Etapa 1 antes de iniciar as próximas.
- **Etapas posteriores, ainda não autorizadas:** remoção do campo de última entrega, cadastros de veículos/motoristas e validações de lançamentos, medições/homepage, indicadores/importação pendentes, exportação administrativa e documentação/recuperação completa. Preservar essas solicitações no plano, sem implementá-las junto com a Etapa 1.

## Detalhes técnicos
- Migrações aditivas, com políticas RLS e permissões explícitas. Não remover tabelas nem colunas históricas. A exclusão dos 677 registros antigos é a exceção expressamente autorizada e concluída na Limpeza A; exclusões posteriores somente pelo fluxo autorizado com motivo e auditoria completa, ou pela Limpeza B após novo pedido.
- `public.profiles` para dados de conta e `public.user_roles` para papéis protegidos; autorização baseada em identidade validada, nunca em armazenamento do navegador ou metadados editáveis do usuário.
- Usuário curto único para ambos os tipos, convertido em endereço `users.invalid`. Contas criadas exclusivamente pela API administrativa com confirmação individual, nunca habilitando auto-confirmação global. Senhas continuam no serviço Auth; papéis e estado ativo são verificados no banco. Não enviar recuperação ao domínio interno; somente o e-mail real existente mantém recuperação de emergência.
- Validar tipo e estado ativo no banco em cada operação protegida. Bloquear usuários desativados mesmo com sessão anterior válida; efetuar mudanças de tipo e proteção do último ADM ativo com controle transacional, não apenas checagem da interface.
- Registrar último acesso após autenticação confirmada pelo serviço, usando horário confiável do servidor. Provisionamento e redefinições devem auditar resultados confirmados, sem armazenar ou devolver senhas, hashes ou tokens em perfis, registros de auditoria ou exportações.
- Funções autenticadas do servidor para provisionamento e ações administrativas. Verificar ADM antes de qualquer acesso privilegiado.
- Auditoria gerada no banco para operações importantes, sem permissões de alteração/exclusão pela aplicação, inclusive para ADM.
- Revisar também as funções existentes que executam com privilégios elevados: cada uma deve validar conta ativa e autorização, para que a importação legada não contorne as novas políticas. Bloquear edição/exclusão direta sem motivo, inclusive por ADM; usar operações transacionais auditadas para essas ações.
- Para dispensar a última entrega obrigatória sem apagar a estrutura antiga, adicionar um campo opcional sucessor, preservar/backfill do histórico e deixar a coluna antiga documentada como legada; novos pedidos não devem receber datas falsas.
- Consultas paginadas com ordenação estável e campos autorizados para exportação; proteção contra fórmulas maliciosas em CSV e serialização de arrays/objetos.

## Dependências para concluir a implantação
- Concluir a senha da conta inicial: o serviço recusou o valor autorizado como senha fraca (HTTP 422, `weak_password`). Não desativar proteção contra senhas vazadas; solicitar senha alternativa em formulário seguro. A marca de inicialização e a promoção ainda não foram consumidas/aplicadas.
- Validação dos recursos reais de backup e restauração disponíveis no Lovable Cloud.
- Liberação de fotos públicas permanece pendente de administrador do workspace; manter fotos privadas enquanto isso.
