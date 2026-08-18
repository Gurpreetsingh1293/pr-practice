// Server component: awaits async params (Next.js 15), renders client child
import OrderDetailClient from './OrderDetailClient';

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetailClient id={id} />;
}
