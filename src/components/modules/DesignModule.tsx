import React, { useRef, useState } from 'react';
import { Download, ImagePlus, LoaderCircle, Sparkles, Upload, X } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

type ImageResult = {
  mime_type: string;
  imagem_base64: string;
  mensagem?: string;
  modelo?: string;
  estado?: string;
};

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem.'));
    reader.onload = () => {
      const value = String(reader.result || '');
      const comma = value.indexOf(',');
      if (comma < 0) reject(new Error('O arquivo não foi codificado corretamente.'));
      else resolve(value.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });
}

export const DesignModule: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState('');
  const [result, setResult] = useState<ImageResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const chooseFile = async (file?: File) => {
    setError('');
    if (!file) return;
    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Formato não suportado. Selecione PNG, JPEG ou WebP.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('A imagem pode ter no máximo 8 MiB.');
      return;
    }
    setSourceFile(file);
    setSourcePreview(await readAsBase64(file).then((value) => 'data:' + file.type + ';base64,' + value));
    setResult(null);
  };

  const createImage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setError('Descreva a imagem que deseja criar ou a edição que precisa.');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const imageBase64 = sourceFile ? await readAsBase64(sourceFile) : undefined;
      const response = await nyxosApi.generateOrEditImage({
        prompt: prompt.trim(),
        imageBase64,
        mimeType: sourceFile?.type,
      });
      const image = typeof response.imagem_base64 === 'string' ? response.imagem_base64 : '';
      const mime = typeof response.mime_type === 'string' ? response.mime_type : 'image/png';
      if (!image) throw new Error('O Gemini não retornou um arquivo de imagem.');
      setResult({
        mime_type: mime,
        imagem_base64: image,
        mensagem: typeof response.mensagem === 'string' ? response.mensagem : '',
        modelo: typeof response.modelo === 'string' ? response.modelo : '',
        estado: typeof response.estado === 'string' ? response.estado : '',
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao criar a imagem.');
    } finally {
      setBusy(false);
    }
  };

  const resultUrl = result ? 'data:' + result.mime_type + ';base64,' + result.imagem_base64 : '';

  return (
    <div className="h-full overflow-y-auto bg-[#0b0c13] p-4 text-zinc-100">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
          <Sparkles className="h-5 w-5 text-violet-300" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Nyxal Studio · Design e edição</h2>
          <p className="mt-1 text-[11px] text-zinc-500">Gemini Image · criação nova ou edição de imagem enviada</p>
        </div>
      </div>

      <form onSubmit={(event) => void createImage(event)} className="mb-4 space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
        <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400" htmlFor="nyxal-design-prompt">
          Briefing / edição desejada
        </label>
        <textarea
          id="nyxal-design-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Ex.: transforme a imagem em uma arte editorial minimalista, preserve o tema central, contraste alto, paleta preta e violeta, composição 16:9..."
          className="w-full resize-y rounded border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/40"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => void chooseFile(event.target.files?.[0])}
            />
            <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
              <Upload className="h-3.5 w-3.5" /> Enviar imagem para editar
            </button>
            {sourceFile && (
              <button type="button" onClick={() => { setSourceFile(null); setSourcePreview(''); setResult(null); }} className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-2 text-[10px] text-zinc-400 hover:text-white" title="Remover imagem original">
                <X className="h-3 w-3" /> {sourceFile.name}
              </button>
            )}
          </div>
          <button type="submit" disabled={busy || !prompt.trim()} className="inline-flex items-center gap-2 rounded bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {busy ? 'Criando…' : sourceFile ? 'Editar imagem' : 'Criar imagem'}
          </button>
        </div>
        <div className="text-[10px] text-zinc-600">PNG, JPEG ou WebP · máximo 8 MiB · a imagem original não é alterada nem guardada no servidor.</div>
      </form>

      {error && <div className="mb-4 rounded border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">{error}</div>}

      {(sourcePreview || resultUrl) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sourcePreview && (
            <section className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Original</div>
              <img src={sourcePreview} alt="Imagem original para edição" className="max-h-[420px] w-full rounded object-contain" />
            </section>
          )}
          {resultUrl && result && (
            <section className="min-w-0 rounded-lg border border-violet-500/20 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-300">{result.estado === 'imagem_editada' ? 'Resultado editado' : 'Imagem criada'}</span>
                <a href={resultUrl} download={'nyxal-' + Date.now() + '.' + (result.mime_type.split('/')[1] || 'png')} className="inline-flex items-center gap-1 rounded border border-violet-500/20 px-2 py-1 text-[10px] text-violet-200 hover:bg-violet-500/10">
                  <Download className="h-3 w-3" /> Salvar
                </a>
              </div>
              <img src={resultUrl} alt="Resultado da criação visual da Nyxal" className="max-h-[420px] w-full rounded object-contain" />
              {result.mensagem && <p className="mt-2 text-[10px] leading-relaxed text-zinc-400">{result.mensagem}</p>}
              {result.modelo && <p className="mt-2 text-[9px] font-mono text-zinc-600">Modelo: {result.modelo}</p>}
            </section>
          )}
        </div>
      )}

      {!sourcePreview && !resultUrl && (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 p-8 text-center">
          <ImagePlus className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-xs text-zinc-400">Seu espaço de criação está pronto.</p>
          <p className="mt-1 max-w-md text-[10px] leading-relaxed text-zinc-600">Descreva a peça visual ou envie uma imagem e diga exatamente o que deve mudar. A imagem só será enviada ao Gemini depois de você pressionar o botão de criação.</p>
        </div>
      )}
    </div>
  );
};
