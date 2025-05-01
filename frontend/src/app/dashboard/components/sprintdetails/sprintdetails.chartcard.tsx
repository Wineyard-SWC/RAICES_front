import { chartCardStyles as s } from "../../styles/chartcardstyles"

type Props = {
  title: string
  placeholderText?: string
  iframeUrl?: string
}

export const ChartCard = ({ title, iframeUrl, placeholderText = "Chart Placeholder" }: Props) => {
    return (
        <div className={s.wrapper}>
          <h3 className={s.title}>{title}</h3>
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              className="w-full h-[10vh] rounded-md border border-gray-200"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className={s.iframePlaceholder}>
              {placeholderText}
            </div>
          )}
        </div>
      )
}
