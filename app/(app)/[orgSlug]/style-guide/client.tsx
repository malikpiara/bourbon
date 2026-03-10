// Interactive style guide client for previewing UI components and design tokens.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Info, RotateCcw, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// --- Default values for CSS custom properties ---
const DEFAULTS = {
  '--primary': '340 100% 31%',
  '--radius': '0.5rem',
  fontFamily: 'Inter',
};

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter', href: null },
  {
    label: 'Noto Sans',
    value: '"Noto Sans", sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap',
  },
  {
    label: 'Gelasio',
    value: '"Gelasio", serif',
    href: 'https://fonts.googleapis.com/css2?family=Gelasio:wght@400;500;700&display=swap',
  },
  {
    label: 'Plus Jakarta Sans',
    value: '"Plus Jakarta Sans", sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap',
  },
  {
    label: 'Outfit',
    value: '"Outfit", sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap',
  },
  {
    label: 'Manrope',
    value: '"Manrope", sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap',
  },
];

const COLOR_TOKENS = [
  { name: '--primary', label: 'Primary' },
  { name: '--primary-foreground', label: 'Primary FG' },
  { name: '--secondary', label: 'Secondary' },
  { name: '--accent', label: 'Accent' },
  { name: '--muted', label: 'Muted' },
  { name: '--muted-foreground', label: 'Muted FG' },
  { name: '--destructive', label: 'Destructive' },
  { name: '--background', label: 'Background' },
  { name: '--foreground', label: 'Foreground' },
  { name: '--border', label: 'Border' },
  { name: '--card', label: 'Card' },
  { name: '--sidebar-background', label: 'Sidebar BG' },
  { name: '--sidebar-accent', label: 'Sidebar Accent' },
];

export function StyleGuideClient() {
  const [hue, setHue] = useState(340);
  const [radius, setRadius] = useState(0.5);
  const [font, setFont] = useState('Inter');
  const loadedFontsRef = useRef(new Set<string>());

  const loadFont = useCallback((fontOption: (typeof FONT_OPTIONS)[number]) => {
    if (!fontOption.href || loadedFontsRef.current.has(fontOption.value))
      return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontOption.href;
    document.head.appendChild(link);
    loadedFontsRef.current.add(fontOption.value);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', `${hue} 100% 31%`);
    return () => {
      document.documentElement.style.setProperty(
        '--primary',
        DEFAULTS['--primary']
      );
    };
  }, [hue]);

  useEffect(() => {
    document.documentElement.style.setProperty('--radius', `${radius}rem`);
    return () => {
      document.documentElement.style.setProperty(
        '--radius',
        DEFAULTS['--radius']
      );
    };
  }, [radius]);

  useEffect(() => {
    const option = FONT_OPTIONS.find((f) => f.label === font);
    if (!option) return;
    loadFont(option);
    document.documentElement.style.setProperty('--font-inter', option.value);
    return () => {
      document.documentElement.style.setProperty(
        '--font-inter',
        DEFAULTS.fontFamily
      );
    };
  }, [font, loadFont]);

  const handleReset = () => {
    setHue(340);
    setRadius(0.5);
    setFont('Inter');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12 p-8">
      <div>
        <h1 className="text-2xl font-bold">Style Guide</h1>
        <p className="text-muted-foreground">
          Visualiza e testa componentes, fontes, cores e espa&ccedil;amento.
        </p>
      </div>

      {/* ---- Design Token Controls ---- */}
      <Section title="Design Tokens">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Fonte</Label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.label} value={f.label}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Cor prim&aacute;ria &mdash; hue:{' '}
              <span className="font-mono">{hue}</span>
            </Label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[hue]}
              onValueChange={([v]) => setHue(v)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Border radius &mdash;{' '}
              <span className="font-mono">{radius}rem</span>
            </Label>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[radius]}
              onValueChange={([v]) => setRadius(v)}
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleReset}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Repor valores
        </Button>
      </Section>

      {/* ---- Color Palette ---- */}
      <Section title="Paleta de Cores">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {COLOR_TOKENS.map((token) => (
            <div key={token.name} className="space-y-1">
              <div
                className="h-12 rounded-md border"
                style={{ background: `hsl(var(${token.name}))` }}
              />
              <p className="text-xs font-medium">{token.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {token.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- Buttons ---- */}
      <Section title="Button">
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Info />
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      {/* ---- Inputs ---- */}
      <Section title="Input &amp; Textarea">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sg-input">Input</Label>
            <Input id="sg-input" placeholder="Escreve aqui..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sg-disabled">Disabled</Label>
            <Input id="sg-disabled" placeholder="Desativado" disabled />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sg-textarea">Textarea</Label>
            <Textarea id="sg-textarea" placeholder="Texto longo..." />
          </div>
        </div>
      </Section>

      {/* ---- Select ---- */}
      <Section title="Select">
        <div className="max-w-xs">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Escolhe uma op&ccedil;&atilde;o" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Op&ccedil;&atilde;o A</SelectItem>
              <SelectItem value="b">Op&ccedil;&atilde;o B</SelectItem>
              <SelectItem value="c">Op&ccedil;&atilde;o C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* ---- Checkbox & Radio ---- */}
      <Section title="Checkbox &amp; Radio">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label>Checkboxes</Label>
            <div className="flex items-center gap-2">
              <Checkbox id="sg-ck1" />
              <Label htmlFor="sg-ck1" className="font-normal">
                Aceito os termos
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sg-ck2" defaultChecked />
              <Label htmlFor="sg-ck2" className="font-normal">
                Newsletter
              </Label>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Radio Group</Label>
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="sg-r1" />
                <Label htmlFor="sg-r1" className="font-normal">
                  Op&ccedil;&atilde;o A
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="sg-r2" />
                <Label htmlFor="sg-r2" className="font-normal">
                  Op&ccedil;&atilde;o B
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </Section>

      {/* ---- Slider ---- */}
      <Section title="Slider">
        <div className="max-w-sm">
          <Slider defaultValue={[50]} max={100} step={1} />
        </div>
      </Section>

      {/* ---- Card ---- */}
      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>T&iacute;tulo do Cart&atilde;o</CardTitle>
              <CardDescription>
                Descri&ccedil;&atilde;o breve do conte&uacute;do.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Conte&uacute;do do cart&atilde;o. Pode incluir texto,
                formul&aacute;rios ou outros componentes.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">A&ccedil;&atilde;o</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Segundo Cart&atilde;o</CardTitle>
              <CardDescription>
                Variante com outro conte&uacute;do.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Texto secund&aacute;rio a demonstrar o estilo muted.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ---- Alert ---- */}
      <Section title="Alert">
        <div className="space-y-3">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Nota</AlertTitle>
            <AlertDescription>
              Informa&ccedil;&atilde;o geral sobre o sistema.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Algo correu mal. Tenta novamente.
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* ---- Table ---- */}
      <Section title="Table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead className="text-right">Pre&ccedil;o</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Sof&aacute; Luca</TableCell>
              <TableCell>2</TableCell>
              <TableCell className="text-right">1.200,00 &euro;</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Mesa Nilo</TableCell>
              <TableCell>1</TableCell>
              <TableCell className="text-right">450,00 &euro;</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cadeira Oslo</TableCell>
              <TableCell>4</TableCell>
              <TableCell className="text-right">180,00 &euro;</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      {/* ---- Skeleton ---- */}
      <Section title="Skeleton">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Section>

      {/* ---- Separator ---- */}
      <Section title="Separator">
        <div className="space-y-2">
          <p className="text-sm">Acima do separador</p>
          <Separator />
          <p className="text-sm">Abaixo do separador</p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
