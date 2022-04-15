import styles from './spinner.module.css'

export default function Spinner({ children }) {
  return (
    <div className={styles.spinner}>
      <i className={`${styles.icon} fa fa-spinner`} />
      {children}
    </div>
  )
}
