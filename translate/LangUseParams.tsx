
import { useParams } from 'next/navigation'

const LangUseParams = () => {

    // lang
    const { lang }: { lang?: string } = useParams();
    return (lang)
}

export default LangUseParams