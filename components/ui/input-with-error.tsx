import { Input } from './input';
import { useEnterKeyBlur } from '@/hooks/useEnterKeyBlur';

interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function InputWithError({
  error,
  onKeyDown,
  ...props
}: InputWithErrorProps) {
  const handleEnterKey = useEnterKeyBlur();
  return (
    <div>
      <Input
        {...props}
        // Combine any existing onKeyDown handler with our enter key handler
        onKeyDown={(e) => {
          handleEnterKey(e);
          // Call the original onKeyDown if it exists
          onKeyDown?.(e);
        }}
      />
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}
