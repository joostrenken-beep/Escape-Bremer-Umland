/** URL einer Mediendatei aus einem Stadtpaket (z. B. "media/zeuge.mp3"). */
export const mediaUrl = (tourId: string, path: string) => `${import.meta.env.BASE_URL}tours/${tourId}/${path}`;
