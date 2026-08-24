export default function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`permissions-tabpanel-${index}`}
            aria-labelledby={`permissions-tab-${index}`}
            className={value === index ? 'block' : 'hidden'}
            {...other}
        >
            <div className="p-4 sm:p-6">{children}</div>
        </div>
    )
}