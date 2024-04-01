import { Form as RemixForm, type FormProps as RFormProps } from '@remix-run/react';
import { forwardRef } from 'react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';

export type CustomFormProps = RFormProps & {
  /**
   * Allows the passing of a fetcher.Form
   * @default RForm
   */
  as?: typeof RemixForm;
  /*
   * Used on routes with multiple actions to identify the submitted form.
   * @default undefined
   */
  actionId?: string;
  /*
   * Tells the action where to send a successful response
   * @default undefined
   */
  redirectTo?: string;
  autoFooter?: boolean;
};

export const CustomForm = forwardRef<HTMLFormElement, CustomFormProps>(
  ({ children, as, method = 'post', ...props }, ref) => {
    const Form = as || RemixForm;

    return (
      <Form ref={ref} {...props} method={method}>
        <AuthenticityTokenInput />
        {children}
      </Form>
    );
  }
);
CustomForm.displayName = 'CustomForm';
