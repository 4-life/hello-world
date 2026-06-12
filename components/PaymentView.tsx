'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Wifi } from 'lucide-react';
import { formatLabel } from '@/app/orders/statusBadge';
import type { InvoicePaymentQuery } from '@/app/libs/getInvoicePayment';
import usePayInvoice from '@/app/libs/payInvoice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

interface Props {
  invoice: NonNullable<InvoicePaymentQuery['invoicePayment']>;
}

const CARD_FIELD_CLASS =
  'rounded-none border-0 border-b border-white/30 bg-transparent px-0 text-white placeholder:text-white/40 focus-visible:border-white focus-visible:ring-0';

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

type CardBrand = 'visa' | 'mastercard' | null;

function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits) return null;

  if (/^4/.test(digits)) return 'visa';

  if (
    /^5[1-5]/.test(digits) ||
    /^2(2[2-9]|[3-6]\d|7[01])/.test(digits) ||
    /^27[01]\d/.test(digits)
  ) {
    return 'mastercard';
  }

  return null;
}

const CARD_BRAND_LOGOS: Record<Exclude<CardBrand, null>, string> = {
  visa: '/pay-logos/Visa_Inc.-Logo.wine.svg',
  mastercard: '/pay-logos/Mastercard-Logo.wine.svg',
};

export default function PaymentView({ invoice }: Props): React.JSX.Element {
  const [paymentStatus, setPaymentStatus] = useState<string>(
    invoice.paymentStatus,
  );
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [serverError, setServerError] = useState<string>('');

  const [payInvoice, { loading: isLoading }] = usePayInvoice();

  const cardBrand = detectCardBrand(cardNumber);

  const isUnpaid = paymentStatus === 'UNPAID';

  const isCardComplete =
    cardNumber.replace(/\D/g, '').length === 16 &&
    cardHolder.trim().length > 0 &&
    expiry.length === 5 &&
    (cvv.length === 3 || cvv.length === 4);

  async function handlePay(): Promise<void> {
    setServerError('');
    try {
      const { data } = await payInvoice({ variables: { id: invoice.id } });
      if (data?.payInvoice) {
        setPaymentStatus(data.payInvoice.paymentStatus);
        toast.success('Payment successful');
      }
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to process payment',
      );
    }
  }

  return (
    <div className="w-full space-y-4 relative">
      {isUnpaid ? (
        <>
          <div className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-5 text-white shadow-lg flex flex-col justify-between shadow-black/50 mb-15 z-10 relative">
            <div className="flex items-center justify-between">
              <span>
                Paying:{' '}
                <span className="text-xl font-bold">
                  ${invoice.amount.toFixed(2)}
                </span>
              </span>
              {cardBrand ? (
                <Image
                  src={CARD_BRAND_LOGOS[cardBrand]}
                  alt={cardBrand}
                  width={60}
                  height={44}
                  unoptimized
                  className="h-10 w-14 object-contain"
                />
              ) : (
                <div className="w-14 h-10 flex items-center justify-end">
                  <Wifi className="size-6 rotate-90 opacity-80" />
                </div>
              )}
            </div>

            <Input
              value={cardNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCardNumber(formatCardNumber(e.target.value))
              }
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              maxLength={19}
              className={`text-lg tracking-[0.2em] ${CARD_FIELD_CLASS}`}
            />

            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <FieldLabel className="text-[10px] uppercase tracking-wide text-white/60">
                  Card holder
                </FieldLabel>
                <Input
                  value={cardHolder}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCardHolder(e.target.value.toUpperCase())
                  }
                  placeholder="JOHN DOE"
                  className={CARD_FIELD_CLASS}
                />
              </div>

              <div className="w-20">
                <FieldLabel className="text-[10px] uppercase tracking-wide text-white/60">
                  Expires
                </FieldLabel>
                <Input
                  value={expiry}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setExpiry(formatExpiry(e.target.value))
                  }
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength={5}
                  className={CARD_FIELD_CLASS}
                />
              </div>
            </div>
          </div>

          <div className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-lg overflow-hidden flex flex-col absolute bottom-10 -right-30 shadow-black/50 items-end">
            <div className="mt-6 h-10 w-full bg-black" />

            <div className="mt-6 flex justify-end px-5 w-30">
              <Field className="w-28">
                <FieldLabel className="text-[10px] uppercase tracking-wide text-white/60">
                  CVC/CVV
                </FieldLabel>
                <Input
                  value={cvv}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  placeholder="xxx-x"
                  inputMode="numeric"
                  maxLength={4}
                  className="bg-white text-center text-slate-900"
                />
                <span className="text-[10px] text-white/60">
                  Last 3 or 4 digits
                </span>
              </Field>
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          {isCardComplete && (
            <Button onClick={handlePay} disabled={isLoading} className="w-full">
              {isLoading ? 'Processing…' : 'Pay now'}
            </Button>
          )}
        </>
      ) : (
        <p className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
          This invoice is {formatLabel(paymentStatus)}. No payment is required.
        </p>
      )}
    </div>
  );
}
