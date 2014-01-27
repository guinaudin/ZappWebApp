package fr.ece.historic;

import commonj.work.Work;

public class WorkTranslatorWrapper implements HistoricMaker ,Work {
    private final HistoricMaker historicMaker;

    public WorkTranslatorWrapper(HistoricMaker historicMaker) {
        this.historicMaker = historicMaker;
    }

    @Override
    public void release() {
    }

    @Override
    public boolean isDaemon() {
        return false;
    }
    
    @Override
    public void realizeHistoric() {
        historicMaker.realizeHistoric();
    }

    @Override
    public void run() {
        realizeHistoric();
    }
}
