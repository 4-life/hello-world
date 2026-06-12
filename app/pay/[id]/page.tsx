import { notFound } from 'next/navigation';
import Image from 'next/image';
import getInvoicePayment from '@/app/libs/getInvoicePayment';
import PaymentView from '@/components/PaymentView';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;

  const { data, error } = await getInvoicePayment(id);

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  if (!data?.invoicePayment) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6">
      <Image
        src="/logo.png"
        alt="ERP/CMMS"
        width={160}
        height={64}
        priority
        className="mb-6 bg-primary rounded-md p-2"
      />

      <PaymentView invoice={data.invoicePayment} />
    </div>
  );
}
