import Grid from './components/grid'

function App() {
  return (
    <div className="relative flex h-screen w-screen bg-surface p-6 gap-6 antialiased overflow-hidden text-on-surface">
      <Grid />
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-surface-bright/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
      </div>
    </div>
  )
}

export default App