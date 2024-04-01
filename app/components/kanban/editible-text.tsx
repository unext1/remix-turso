import { useFetcher } from '@remix-run/react';
import { forwardRef, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const SaveButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  return <Button ref={ref} tabIndex={0} {...props} variant="default" size="sm" />;
});

export const CancelButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => {
    return <Button ref={ref} type="button" tabIndex={0} {...props} variant="destructive" size="sm" />;
  }
);

export function EditableText({
  children,
  fieldName,
  value,
  inputLabel,
  buttonLabel
}: {
  children: React.ReactNode;
  fieldName: string;
  value: string;
  inputLabel: string;
  buttonLabel: string;
}) {
  const fetcher = useFetcher();
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (fetcher.formData?.has(fieldName)) {
    value = String(fetcher.formData.get('name'));
  }

  return edit ? (
    <fetcher.Form
      method="post"
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        flushSync(() => {
          setEdit(false);
          fetcher.submit(event?.currentTarget);
        });
        buttonRef.current?.focus();
      }}
    >
      {children}
      <Input
        required
        ref={inputRef}
        type="text"
        className="w-full text-sm font-semibold"
        aria-label={inputLabel}
        name={fieldName}
        defaultValue={value}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            flushSync(() => {
              setEdit(false);
            });
            buttonRef.current?.focus();
          }
        }}
        onBlur={(event) => {
          console.log('blur');
          if (inputRef.current?.value !== value && inputRef.current?.value.trim() !== '') {
            fetcher.submit(event.currentTarget);
          }
          setEdit(false);
        }}
      />
    </fetcher.Form>
  ) : (
    <Button
      variant="default"
      aria-label={buttonLabel}
      type="button"
      className="text-sm justify-start h-9 w-full px-[13px] font-semibold "
      ref={buttonRef}
      onClick={() => {
        flushSync(() => {
          setEdit(true);
        });
        inputRef.current?.select();
      }}
    >
      {value || <span className="text-primary">Edit</span>}
    </Button>
  );
}
