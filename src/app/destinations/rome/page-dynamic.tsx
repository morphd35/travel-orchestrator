import DestinationPageTemplate from '@/components/DestinationPageTemplate';
import { getDestination } from '@/lib/destinationData';
import { notFound } from 'next/navigation';

export default function RomeDestinationDynamic() {
    const destination = getDestination('rome');

    if (!destination) {
        notFound();
    }

    return <DestinationPageTemplate destination={destination} />;
}
