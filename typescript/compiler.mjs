// Shared semantic checker used by the browser Worker and Node content audits.
export const COMPILER_VERSION = '6.0.3';
export const FILE_PREFIX = '/course/';

export function createChecker(ts, libraries) {
  if (ts.version !== COMPILER_VERSION) throw Error(`需要 TypeScript ${COMPILER_VERSION}，收到 ${ts.version}`);
  const librarySources = new Map();
  let oldProgram;
  const defaults = {
    strict: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, noEmit: true, skipLibCheck: true,
    types: [], lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], ignoreDeprecations: '6.0',
    // Keep optional/index semantics explicit instead of inheriting future defaults.
    exactOptionalPropertyTypes: false, noUncheckedIndexedAccess: false,
  };
  function compile(files, settings = {}, project = {}, generate = false) {
    const converted = ts.convertCompilerOptionsFromJson(settings, FILE_PREFIX);
    const virtual = Object.fromEntries(Object.entries(files).map(([name, value]) => [FILE_PREFIX + name, value]));
    const getText = (file) => virtual[file] ?? libraries[file.split('/').at(-1)];
    const normalize = path => {
      const parts=[];for(const part of path.replace(/\\/g,'/').split('/')){if(part==='..')parts.pop();else if(part&&part!=='.')parts.push(part);}
      return '/'+parts.join('/');
    };
    const entries = directory => {
      const prefix=normalize(directory).replace(/\/$/,'')+'/';const names=new Set(),directories=new Set();
      for(const file of Object.keys(virtual)){if(!file.startsWith(prefix))continue;const rest=file.slice(prefix.length);const slash=rest.indexOf('/');if(slash<0)names.add(rest);else directories.add(rest.slice(0,slash));}
      return {files:[...names].sort(),directories:[...directories].sort()};
    };
    const readDirectory=(path,extensions,excludes,includes,depth)=>ts.matchFiles(path,extensions,excludes,includes,true,FILE_PREFIX,depth,entries,normalize);
    const configErrors=[];let parsed;
    if(project.configFile){
      const configPath=normalize(FILE_PREFIX+project.configFile);
      const source=virtual[configPath];
      if(source===undefined){configErrors.push({code:5083,category:ts.DiagnosticCategory.Error,messageText:'找不到练习配置文件：'+project.configFile});}
      else {
        const json=ts.parseConfigFileTextToJson(configPath,source);
        if(json.error)configErrors.push(json.error);
        else {
          const configHost={useCaseSensitiveFileNames:true,fileExists:path=>getText(normalize(path))!==undefined,readFile:path=>getText(normalize(path)),
            readDirectory};
          parsed=ts.parseJsonConfigFileContent(json.config,configHost,configPath.slice(0,configPath.lastIndexOf('/')),undefined,configPath);
          configErrors.push(...parsed.errors);
        }
      }
    }
    const options={...defaults,...parsed?.options,...converted.options};
    // Harness checking stays enabled; negative tests still enforce the lesson's intended options.
    options.noEmit=generate?(converted.options.noEmit??parsed?.options.noEmit??false):true;options.noCheck=false;
    const emitted={};
    const host = {
      getSourceFile(file, language) {
        const text = getText(file);
        if (text === undefined) return undefined;
        if (file.startsWith('/lib/')) {
          if (!librarySources.has(file)) librarySources.set(file, ts.createSourceFile(file, text, language, true));
          return librarySources.get(file);
        }
        return ts.createSourceFile(file, text, language, true);
      },
      getDefaultLibFileName: () => '/lib/lib.es2022.full.d.ts',
      getCurrentDirectory: () => FILE_PREFIX.slice(0, -1),
      getCanonicalFileName: (f) => f, useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n', writeFile(file,text) {emitted[file.replace(FILE_PREFIX,'')]=text;}, fileExists: (file) => getText(file) !== undefined,
      readFile: getText, directoryExists: (dir) => dir === '/' || dir.startsWith('/lib') || dir.startsWith('/course'),
      getDirectories: () => [], realpath: (p) => p, readDirectory,
    };
    const configuredRoots=parsed?.fileNames || Object.keys(virtual).filter(name => /\.tsx?$/.test(name) || (options.allowJs && /\.jsx?$/.test(name)));
    const roots=[...new Set([...configuredRoots,...(project.extraRoots||[]).map(name=>normalize(FILE_PREFIX+name))])];
    const program = ts.createProgram({rootNames:roots,options,host,oldProgram,projectReferences:parsed?.projectReferences});
    oldProgram = program;
    const emission=generate?program.emit():undefined;
    const rawDiagnostics=[...converted.errors,...configErrors,...ts.getPreEmitDiagnostics(program),...(emission?.diagnostics||[])];
    const unique=new Map(rawDiagnostics.map(d=>[[d.file?.fileName,d.start,d.code,ts.flattenDiagnosticMessageText(d.messageText,'\n')].join(':'),d]));
    const diagnostics = [...unique.values()].map((d) => {
      const pos = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      return {
        code: d.code, file: d.file?.fileName.replace(FILE_PREFIX, '') || '',
        line: pos ? pos.line + 1 : null, column: pos ? pos.character + 1 : null,
        message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      };
    });
    return { diagnostics, program, rootNames:configuredRoots.map(name=>name.replace(FILE_PREFIX,'')), options, output:emitted, emitSkipped:emission?.emitSkipped };
  }
  function emit(files,settings={},project={}){
    const {diagnostics,output,emitSkipped}=compile(files,settings,project,true);
    return {diagnostics,output,emitSkipped};
  }
  function restrictions(files, rules = {}) {
    const failures = [];
    for (const [name, text] of Object.entries(files)) {
      if (text.length > 80000) { failures.push(`${name}：代码过长，请保留解题所需内容。`); continue; }
      const source = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true);
      // Check actual comment tokens, not strings containing those words.
      const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, text);
      while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
        const token = scanner.getToken();
        if ([ts.SyntaxKind.SingleLineCommentTrivia, ts.SyntaxKind.MultiLineCommentTrivia].includes(token)
          && /@ts-(ignore|nocheck|expect-error)\b/.test(scanner.getTokenText())) failures.push(`${name}：本题不能用忽略诊断注释跳过检查。`);
      }
      function visit(node) {
        if (!rules.allowAny && node.kind === ts.SyntaxKind.AnyKeyword) failures.push(`${name}：本题需要保留类型约束，不能使用 any。`);
        if (!rules.allowAssertions && (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node))) {
          if (node.type?.getText(source) !== 'const') failures.push(`${name}：本题需要通过检查或正确建模解决问题，不能使用类型断言。`);
        }
        if (!rules.allowAssertions && ts.isNonNullExpression(node)) failures.push(`${name}：请检查空值，不使用非空断言。`);
        if (ts.isModuleDeclaration(node) && (!rules.allowAmbient)) failures.push(`${name}：本题不允许修改全局或模块声明。`);
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
    return [...new Set(failures)];
  }
  function judge(question, submitted) {
    const allowed = Object.keys(question.files || {});
    if (!submitted || typeof submitted !== 'object' || allowed.some((name) => typeof submitted[name] !== 'string')
      || Object.keys(submitted).some((name) => !allowed.includes(name))) return { passed: false, checks: [], diagnostics: [], errors: ['练习文件不完整。'] };
    const errors = restrictions(submitted, question.rules);
    if (errors.length) return { passed: false, checks: [], diagnostics: [], errors };
    const allFiles = { ...question.supportFiles, ...submitted };
    const base = compile(allFiles, question.compilerOptions, question.project);
    const checks = [{ name: '练习代码通过类型检查', passed: base.diagnostics.length === 0 }];
    if (base.diagnostics.length) return { passed: false, checks, diagnostics: base.diagnostics, errors: [] };
    if(question.project){
      const included=new Set(base.program.getSourceFiles().map(file=>file.fileName.replace(FILE_PREFIX,'')));
      for(const name of question.project.requiredFiles||[])checks.push({name:'项目包含 '+name,passed:included.has(name)});
      for(const name of question.project.excludedFiles||[])checks.push({name:'项目不包含 '+name,passed:!included.has(name)});
      for(const [name,wanted] of Object.entries(question.project.requiredOptions||{}))checks.push({name:`项目选项 ${name} 符合要求`,passed:Object.is(base.options[name],wanted)});
      if(question.project.referenceFiles){const actual=(base.program.getResolvedProjectReferences()||[]).map(ref=>ref?.sourceFile.fileName.replace(FILE_PREFIX,'')||'').sort();checks.push({name:'直接项目引用符合要求',passed:JSON.stringify(actual)===JSON.stringify([...question.project.referenceFiles].sort())});}
      if(question.project.rootFiles){const actual=[...base.rootNames].sort();const wanted=[...question.project.rootFiles].sort();checks.push({name:'项目入口文件符合要求',passed:JSON.stringify(actual)===JSON.stringify(wanted)});}
    }
    const diagnostics = [];
    for (const [i, test] of (question.tests || []).entries()) {
      const testFile = `__test_${i}.ts`;
      const variants = test.supportFiles || {};
      if (Object.entries(variants).some(([name,source]) => !Object.hasOwn(question.supportFiles || {}, name)
        || Object.hasOwn(submitted,name) || typeof source !== 'string')) {
        checks.push({name:test.name,passed:false});
        errors.push('模型变体只能替换题目提供的只读文件。');
        continue;
      }
      const result = compile({ ...allFiles, ...variants, [testFile]: test.code }, question.compilerOptions, {...question.project,extraRoots:[testFile]});
      const expected = result.diagnostics.filter((d) => d.file === testFile && (!test.codes || test.codes.includes(d.code)));
      const unexpected = result.diagnostics.filter((d) => d.file !== testFile);
      const passed = test.expect === 'error' ? expected.length > 0 && unexpected.length === 0
        && result.diagnostics.every((d) => d.file === testFile && (!test.codes || test.codes.includes(d.code))) : result.diagnostics.length === 0;
      checks.push({ name: test.name, passed });
      if (!passed) diagnostics.push(...result.diagnostics);
    }
    for(const test of question.emissionTests||[]){
      const variants=test.supportFiles||{};
      if(Object.entries(variants).some(([name,source])=>!Object.hasOwn(question.supportFiles||{},name)||Object.hasOwn(submitted,name)||typeof source!=='string')){
        checks.push({name:test.name,passed:false});errors.push('输出测试只能替换题目提供的只读文件。');continue;
      }
      const result=emit({...allFiles,...variants},question.compilerOptions,question.project);
      const codes=[...new Set(result.diagnostics.map(d=>d.code))].sort((a,b)=>a-b);
      const wanted=[...new Set(test.diagnosticCodes||[])].sort((a,b)=>a-b);
      const failures=[];
      if(JSON.stringify(codes)!==JSON.stringify(wanted))failures.push('编译诊断不符合要求');
      if(test.files&&JSON.stringify(Object.keys(result.output).sort())!==JSON.stringify([...test.files].sort()))failures.push('生成文件不符合要求');
      if(test.emitSkipped!==undefined&&result.emitSkipped!==test.emitSkipped)failures.push('是否跳过输出不符合要求');
      for(const [field,required]of [['requiredSyntax',true],['forbiddenSyntax',false]])for(const [file,names]of Object.entries(test[field]||{})){
        if(!(file in result.output)){failures.push('未生成 '+file);continue;}
        const source=ts.createSourceFile(file,result.output[file],ts.ScriptTarget.Latest,true);
        const kinds=new Set();const visit=node=>{kinds.add(node.kind);ts.forEachChild(node,visit);};visit(source);
        for(const name of names){const kind=ts.SyntaxKind[name];if(kind===undefined||kinds.has(kind)!==required)failures.push(file+' 的 '+name+' 语法不符合要求');}
      }
      checks.push({name:test.name,passed:failures.length===0,...(failures.length?{message:failures.join('；')}: {})});
      if(JSON.stringify(codes)!==JSON.stringify(wanted))diagnostics.push(...result.diagnostics);
    }
    const passed = checks.every((c) => c.passed);
    const output = passed && question.runtime?.length ? Object.fromEntries(Object.entries(allFiles)
      .filter(([name]) => !name.endsWith('.d.ts') && /\.(ts|js)$/.test(name))
      .map(([name, source]) => [name.replace(/\.(ts|js)$/, '.js'), ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, ...base.options, noEmit: false, module: ts.ModuleKind.CommonJS }, fileName: name,
      }).outputText])) : null;
    return { passed, checks, diagnostics, errors, output };
  }
  return { compile, emit, judge, restrictions };
}
