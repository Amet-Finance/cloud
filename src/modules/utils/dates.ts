const minuteInSec = 60
const hourInSec = 60 * minuteInSec
const dayInSec = 24 * hourInSec
const monthInSec = 30 * dayInSec
const yearInSec = 365 * dayInSec

function shortTime(time: number) {
    return new Date(time).toDateString()
}

function formatTime(seconds: number, isShort?: boolean, hideSeconds?: boolean) {

    const years = Math.floor(seconds / yearInSec);
    seconds -= years * yearInSec;

    const months = Math.floor(seconds / monthInSec);
    seconds -= months * monthInSec;

    const days = Math.floor(seconds / dayInSec);
    seconds -= days * dayInSec;

    const hours = Math.floor(seconds / hourInSec);
    seconds -= hours * hourInSec;

    const minutes = Math.floor(seconds / minuteInSec);
    seconds -= minutes * minuteInSec;

    const timeSegments = [];

    const shorten = (text: string) => {
        if (isShort) {
            return text.charAt(0) + "."
        }
        return text
    }

    if (years > 0) {
        const text = shorten(years === 1 ? 'year' : 'years')
        timeSegments.push(`${years} ${text}`);
    }

    if (months > 0) {
        const text = shorten(months === 1 ? 'month' : 'months')
        timeSegments.push(`${months} ${text}`);
    }

    if (days > 0) {
        const text = shorten(days === 1 ? 'day' : 'days')
        timeSegments.push(`${days} ${text}`);
    }

    if (hours > 0) {
        const text = shorten(hours === 1 ? 'hour' : 'hours')
        timeSegments.push(`${hours} ${text}`);
    }

    if (minutes > 0) {
        const text = shorten(minutes === 1 ? 'minute' : 'minutes')
        timeSegments.push(`${minutes} ${text}`);
    }

    if (seconds > 0 && (!hideSeconds || timeSegments.length === 0)) {
        const text = shorten(seconds === 1 ? 'second' : 'seconds')
        timeSegments.push(`${Math.round(seconds)} ${text}`);
    }

    return timeSegments.join(' ');
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


export {
    minuteInSec,
    hourInSec,
    dayInSec,
    monthInSec,
    yearInSec,
    formatTime, shortTime, sleep
}
