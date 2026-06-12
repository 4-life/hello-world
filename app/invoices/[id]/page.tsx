import { notFound } from 'next/navigation';
import getInvoice from '@/app/libs/getInvoice';
import BackButton from '@/components/BackButton';
import InvoiceDetail from './InvoiceDetail';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;

  const { data, error } = await getInvoice(id);

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  if (!data?.invoice) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <BackButton href="/invoices" label="Back to invoices" />

      <h1 className="mb-6 text-2xl font-semibold">
        Invoice #{data.invoice.invoiceNumber}
      </h1>

      <InvoiceDetail invoice={data.invoice} />
    </div>
  );
}
