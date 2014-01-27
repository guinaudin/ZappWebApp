package fr.ece.historic;

public class DummyHistoricMaker implements HistoricMaker{
    private final long delay;
    
    public DummyHistoricMaker(long delay) {
        this.delay = delay;
    }
    
    @Override
    public void realizeHistoric() {
        try {
            Thread.sleep(this.delay);
            
            System.out.print("hello");
        } 
        catch (InterruptedException ignore) { 
        }
    }
}

