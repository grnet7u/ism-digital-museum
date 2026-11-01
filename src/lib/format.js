// event_date is a calendar date ("2025-05-14"); format the string itself so no timezone shift happens.
export const formatDate = (iso) => { const [y, m, d] = iso.split('-'); return `${y} оны ${Number(m)}-р сарын ${Number(d)}` }
