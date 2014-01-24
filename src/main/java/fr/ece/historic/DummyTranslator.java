package fr.ece.historic;

public class DummyTranslator extends AbstractTranslator {

    private final long delay;

    public DummyTranslator(String source, long delay) {
        super(source);
        this.delay = delay;
    }
    
    @Override
    public void translate() {
        // delay to simulate network call
        try {
            Thread.sleep(this.delay);
        }
        catch (InterruptedException ignore) { }
        this.translation = this.source+"_tr";
    }
}
